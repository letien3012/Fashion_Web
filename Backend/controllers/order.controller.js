const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Consignment = require("../models/consignment.model");
const ImageModel = require("../models/image.model");

// Generate unique order code
const generateOrderCode = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
};

// Create new order
exports.create = async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      total_product_price,
      total_price,
      discount,
      method,
      note,
    } = req.body;
    console.log(req.body);
    // Process each item and its variants to allocate consignments
    for (const item of items) {
      for (const variant of item.variants) {
        let remainingQuantity = variant.quantity;
        variant.consignments = [];

        // Get all available consignments for this variant, sorted by creation date (oldest first)
        const consignments = await Consignment.find({
          productId: item.productId,
          variantId: variant._id,
          publish: true,
          current_quantity: { $gt: 0 },
        }).sort({ createdAt: 1 });

        console.log(
          `Found ${consignments.length} consignments for variant ${variant.sku} (ID: ${variant._id})`
        );

        // Allocate quantities from consignments
        for (const consignment of consignments) {
          if (remainingQuantity <= 0) break;

          const quantityToTake = Math.min(
            remainingQuantity,
            consignment.current_quantity
          );

          // Add consignment allocation to variant
          variant.consignments.push({
            consignmentId: consignment._id,
            quantity: quantityToTake,
          });

          // Update consignment's current quantity
          await Consignment.decreaseQuantity(consignment._id, quantityToTake);

          remainingQuantity -= quantityToTake;
        }

        // If we couldn't fulfill the entire order
        if (remainingQuantity > 0) {
          throw new Error(
            `Không đủ số lượng cho biến thể ${variant.sku} (ID: ${variant._id}). Cần thêm ${remainingQuantity} sản phẩm.`
          );
        }
      }
    }

    // Create order
    const order = new Order({
      customerId: customerInfo.customerId,
      code: generateOrderCode(),
      fullname: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
      province_code: customerInfo.province_code || "",
      district_code: customerInfo.district_code || "",
      ward_code: customerInfo.ward_code || "",
      order_detail: items,
      total_product_price,
      total_price,
      discount: discount || 0,
      method: method || "COD",
      note: note || "",
      status: "pending",
      voucher: req.body.voucher || null,
    });

    // Update customer information if provided
    if (customerInfo) {
      await Customer.findByIdAndUpdate(customerInfo.customerId, {
        fullname: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        updatedAt: new Date(),
      });
    }

    const savedOrder = await order.save();
    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get order by ID
exports.getById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update order (regular update - doesn't modify employeeId)
exports.update = async (req, res) => {
  try {
    await Order.update(req.params.id, req.body);
    res.status(200).json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order status by employee
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { employeeId } = req.body; // Get employeeId from request body

    await Order.updateStatusByEmployee(req.params.id, employeeId, status);
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order by customer
exports.cancelOrder = async (req, res) => {
  try {
    const { note } = req.body;
    const order = await Order.cancelOrder(req.params.id, note);
    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Process successful payment
exports.processPayment = async (req, res) => {
  try {
    await Order.processSuccessfulPayment(req.params.id);
    res.status(200).json({ message: "Payment processed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order
exports.delete = async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng của khách hàng đang đăng nhập
exports.getOrdersByCustomer = async (req, res) => {
  try {
    // Lấy id từ token đã decode
    const customerId = req.customer.id;
    // Tùy theo model, ví dụ:
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng (cho admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "email fullname phone address")
      .populate("employeeId", "email fullname")
      .populate("order_detail.productId", "name image")
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get total number of orders
exports.getTotalOrders = async (req, res) => {
  try {
    const count = await Order.countDocuments({ deletedAt: null });
    res.status(200).json({ success: true, data: { totalOrders: count } });
  } catch (error) {
    console.error("Error getting total orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get total revenue (sum of total_price from delivered orders)
exports.getTotalRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { status: "delivered", deletedAt: null } },
      { $group: { _id: null, totalRevenue: { $sum: "$total_price" } } },
    ]);
    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    res.status(200).json({ success: true, data: { totalRevenue } });
  } catch (error) {
    console.error("Error getting total revenue:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy dữ liệu doanh thu theo thời gian
exports.getSalesData = async (req, res) => {
  try {
    const { timeFilter, year, month, startDate, endDate } = req.query;
    let matchQuery = { status: "delivered", deletedAt: null };
    let groupBy = {};
    let sortBy = {};

    // Xây dựng query dựa trên bộ lọc thời gian
    switch (timeFilter) {
      case "year":
        if (!year) {
          return res.status(400).json({
            success: false,
            message: "Năm không được để trống",
          });
        }
        matchQuery.createdAt = {
          $gte: new Date(year, 0, 1),
          $lt: new Date(parseInt(year) + 1, 0, 1),
        };
        groupBy = { $month: "$createdAt" };
        sortBy = { _id: 1 };
        break;

      case "month":
        if (!year || !month) {
          return res.status(400).json({
            success: false,
            message: "Năm và tháng không được để trống",
          });
        }
        matchQuery.createdAt = {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        };
        groupBy = { $dayOfMonth: "$createdAt" };
        sortBy = { _id: 1 };
        break;

      case "custom":
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            message: "Ngày bắt đầu và kết thúc không được để trống",
          });
        }
        matchQuery.createdAt = {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        };
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        sortBy = { _id: 1 };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Bộ lọc thời gian không hợp lệ",
        });
    }

    const salesData = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$total_price" },
          count: { $sum: 1 },
        },
      },
      { $sort: sortBy },
    ]);

    // Format dữ liệu cho biểu đồ
    const labels = salesData.map((item) => {
      if (timeFilter === "year") {
        return `Tháng ${item._id}`;
      } else if (timeFilter === "month") {
        return `Ngày ${item._id}`;
      } else {
        return item._id;
      }
    });

    const datasets = [
      {
        label: "Doanh thu",
        data: salesData.map((item) => item.revenue),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        tension: 0.4,
      },
      {
        label: "Số đơn hàng",
        data: salesData.map((item) => item.count),
        borderColor: "#198754",
        backgroundColor: "rgba(25, 135, 84, 0.1)",
        tension: 0.4,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        labels,
        datasets,
      },
    });
  } catch (error) {
    console.error("Error getting sales data:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy top sản phẩm bán chạy
exports.getTopProducts = async (req, res) => {
  try {
    const { timeFilter } = req.query;
    let matchQuery = { status: "delivered", deletedAt: null };
    let dateFilter = {};

    // Xây dựng query dựa trên bộ lọc thời gian
    const now = new Date();
    switch (timeFilter) {
      case "week":
        // Lấy dữ liệu từ đầu tuần đến hiện tại
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Đầu tuần (Chủ nhật)
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { $gte: startOfWeek, $lte: now };
        break;

      case "month":
        // Lấy dữ liệu từ đầu tháng đến hiện tại
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: startOfMonth, $lte: now };
        break;

      case "year":
        // Lấy dữ liệu từ đầu năm đến hiện tại
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { $gte: startOfYear, $lte: now };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Bộ lọc thời gian không hợp lệ",
        });
    }

    matchQuery.createdAt = dateFilter;

    const topProducts = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: "$order_detail" },
      {
        $group: {
          _id: {
            productId: "$order_detail.productId",
            name: "$order_detail.name",
            image: "$order_detail.image",
            sku: "$order_detail.variants.sku",
          },
          totalQuantity: { $sum: { $sum: "$order_detail.variants.quantity" } },
          totalRevenue: {
            $sum: {
              $multiply: [
                { $sum: "$order_detail.variants.quantity" },
                "$order_detail.price",
              ],
            },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          productId: "$_id.productId",
          name: "$_id.name",
          image: "$_id.image",
          sku: "$_id.sku",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Tính tổng số sản phẩm đã bán và tổng doanh thu
    const totals = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: "$order_detail" },
      {
        $group: {
          _id: null,
          totalProductsSold: {
            $sum: { $sum: "$order_detail.variants.quantity" },
          },
          totalRevenue: { $sum: "$total_price" },
        },
      },
    ]);

    // Tính đơn giá trung bình
    const avgPrice =
      totals.length > 0
        ? totals[0].totalRevenue / totals[0].totalProductsSold
        : 0;

    res.status(200).json({
      success: true,
      data: {
        topProducts,
        summary: {
          totalProductsSold:
            totals.length > 0 ? totals[0].totalProductsSold : 0,
          totalRevenue: totals.length > 0 ? totals[0].totalRevenue : 0,
          averagePrice: avgPrice,
        },
      },
    });
  } catch (error) {
    console.error("Error getting top products:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy dữ liệu trạng thái đơn hàng cho biểu đồ trạng thái đơn hàng
exports.getOrderStatus = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusLabels = [
      "pending",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
      "returned",
    ];
    const labelNames = [
      "Đang chờ",
      "Đang xử lý",
      "Đang giao",
      "Đã giao",
      "Đã hủy",
      "Đã trả hàng",
    ];
    const statusCounts = statusLabels.map((status) => {
      const found = result.find((r) => r._id === status);
      return found ? found.count : 0;
    });
    const data = {
      labels: labelNames,
      datasets: [
        {
          data: statusCounts,
          backgroundColor: [
            "#ffc107",
            "#0dcaf0",
            "#0d6efd",
            "#198754",
            "#dc3545",
            "#6c757d",
          ],
        },
      ],
    };
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu trạng thái đơn hàng:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// Request return for an order
exports.requestReturn = async (req, res) => {
  try {
    const { images, note } = req.body;
    const customerId = req.customer.id;

    // Save images to return folder
    const savedImages = await ImageModel.saveMultipleImages(images, "return");

    const order = await Order.requestReturn(
      req.params.id,
      customerId,
      savedImages,
      note
    );
    res.status(200).json({
      message: "Yêu cầu trả hàng đã được gửi thành công",
      order,
    });
  } catch (error) {
    // If there's an error, try to delete any saved images
    if (req.body.images) {
      await ImageModel.deleteMultipleImages(req.body.images);
    }
    res.status(400).json({ message: error.message });
  }
};

// Process return request (for employees)
exports.processReturnRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { employeeId } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message:
          "Trạng thái không hợp lệ. Chỉ chấp nhận 'approved' hoặc 'rejected'",
      });
    }

    const order = await Order.processReturnRequest(
      req.params.id,
      status,
      employeeId
    );

    res.status(200).json({
      success: true,
      message: `Yêu cầu trả hàng đã được ${
        status === "approved" ? "duyệt" : "từ chối"
      }`,
      order,
    });
  } catch (error) {
    console.error("Error processing return request:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

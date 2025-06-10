<template>
  <div class="row g-2">
    <div class="col-md-4">
      <select
        class="form-select"
        v-model="selectedProvinceCode"
        @change="onProvinceChange"
        required
      >
        <option value="">Chọn Tỉnh/Thành</option>
        <option
          v-for="item in filteredProvinces"
          :key="item.code"
          :value="item.code"
        >
          {{ item.name }}
        </option>
      </select>
    </div>
    <div class="col-md-4">
      <select
        class="form-select"
        v-model="selectedDistrictCode"
        @change="onDistrictChange"
        :disabled="!selectedProvinceCode"
        required
      >
        <option value="">Chọn Quận/Huyện</option>
        <option
          v-for="item in filteredDistricts"
          :key="item.code"
          :value="item.code"
        >
          {{ item.name }}
        </option>
      </select>
    </div>
    <div class="col-md-4">
      <select
        class="form-select"
        v-model="selectedWardCode"
        @change="onWardChange"
        :disabled="!selectedDistrictCode"
        required
      >
        <option value="">Chọn Phường/Xã</option>
        <option
          v-for="item in filteredWards"
          :key="item.code"
          :value="item.code"
        >
          {{ item.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";

const emit = defineEmits(["update:location"]);
const API_URL = "http://localhost:3005/api/location";

const props = defineProps({
  provinceCode: String,
  districtCode: String,
  wardCode: String,
});

const filteredProvinces = ref([]);
const filteredDistricts = ref([]);
const filteredWards = ref([]);

const selectedProvinceCode = ref("");
const selectedDistrictCode = ref("");
const selectedWardCode = ref("");

const fetchProvinces = async () => {
  const res = await axios.get(`${API_URL}/provinces`);
  filteredProvinces.value = res.data;
};
const fetchDistricts = async (provinceCode) => {
  if (!provinceCode) return (filteredDistricts.value = []);
  const res = await axios.get(`${API_URL}/provinces/${provinceCode}/districts`);
  filteredDistricts.value = res.data.districts || res.data;
};
const fetchWards = async (districtCode) => {
  if (!districtCode) return (filteredWards.value = []);
  const res = await axios.get(`${API_URL}/districts/${districtCode}/wards`);
  filteredWards.value = res.data.wards || res.data;
};

const emitLocation = () => {
  emit("update:location", {
    province_code: selectedProvinceCode.value,
    district_code: selectedDistrictCode.value,
    ward_code: selectedWardCode.value,
  });
};

const onProvinceChange = async () => {
  await fetchDistricts(selectedProvinceCode.value);
  selectedDistrictCode.value = "";
  selectedWardCode.value = "";
  filteredWards.value = [];
  emitLocation();
};
const onDistrictChange = async () => {
  await fetchWards(selectedDistrictCode.value);
  selectedWardCode.value = "";
  emitLocation();
};
const onWardChange = () => {
  emitLocation();
};

onMounted(async () => {
  await fetchProvinces();
  if (props.provinceCode) {
    selectedProvinceCode.value = props.provinceCode;
    await fetchDistricts(props.provinceCode);
  }
  if (props.districtCode) {
    selectedDistrictCode.value = props.districtCode;
    await fetchWards(props.districtCode);
  }
  if (props.wardCode) {
    selectedWardCode.value = props.wardCode;
  }
});

watch(
  [() => props.provinceCode, () => props.districtCode, () => props.wardCode],
  async ([newProvince, newDistrict, newWard]) => {
    if (newProvince && newProvince !== selectedProvinceCode.value) {
      selectedProvinceCode.value = newProvince;
      await fetchDistricts(newProvince);
      selectedDistrictCode.value = "";
      selectedWardCode.value = "";
      filteredWards.value = [];
    }
    if (newDistrict && newDistrict !== selectedDistrictCode.value) {
      selectedDistrictCode.value = newDistrict;
      await fetchWards(newDistrict);
      selectedWardCode.value = "";
    }
    if (newWard && newWard !== selectedWardCode.value) {
      selectedWardCode.value = newWard;
    }
  }
);
</script>

<style scoped>
.form-select {
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
}
</style>

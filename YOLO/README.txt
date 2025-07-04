# BGE-M3 + YOLO FastAPI Service

This repository provides a step-by-step guide to:

* Clone the BGE-M3 model from Hugging Face
* Set up a Python virtual environment
* Install dependencies from `requirements.txt`
* Run a YOLO-based image service using FastAPI

---

## 1. Clone the BGE-M3 Model

Ensure you have Git LFS installed:

```bash
# Install Git LFS (if not installed)
git lfs install

# Clone the model from Hugging Face
git clone https://huggingface.co/BAAI/bge-m3
```

The model files will be downloaded into a folder named `bge-m3/`.

---

## 2. Set Up Python Virtual Environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the environment (on Windows)
venv\Scripts\activate.bat

# On Unix/macOS:
# source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt
```

---

## 3. Run the YOLO Service

Use Uvicorn to launch the FastAPI service:

```bash
uvicorn yolo_service:app --host 0.0.0.0 --port 9000

```

The service will be available at: [http://localhost:9000](http://localhost:9000)

---

## Project Structure

```
.
├── bge-m3/                  # Cloned BGE-M3 model directory
├── yolo_service.py          # FastAPI application
├── requirements.txt         # Python dependencies
├── README.md                # This documentation file
└── venv/                    # Virtual environment (ignored in Git)
```

---

## Notes

* Ensure the `bge-m3` folder is accessible to your Python code.
* You can integrate YOLO for object detection and use BGE-M3 for semantic embedding and retrieval.

---


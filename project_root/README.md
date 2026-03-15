# AI Disease Outbreak Predictor 🦠

A production-ready machine learning system built with **TensorFlow** to predict potential disease outbreaks using multi-modal digital signals.

## 🚀 Overview

This system integrates three core AI architectures:
1.  **BERT (Transformers):** For semantic understanding of search queries and social media posts.
2.  **LSTM (Temporal):** For capturing time-series trends in pharmacy sales and symptom reports.
3.  **GNN (Spatial):** For modeling how diseases propagate across different geographic regions.

## 📂 Project Structure

```text
project_root/
├── data/
│   ├── synthetic_data_generator.py # Generates training data
│   └── generated_dataset/         # CSV storage
├── models/
│   ├── bert_encoder.py            # Text embedding logic
│   ├── lstm_temporal_model.py     # Trend detection layers
│   ├── gnn_spatial_model.py       # Regional spread logic
│   └── outbreak_predictor.py      # Unified model architecture
├── pipeline/
│   ├── data_preprocessing.py      # Feature engineering
├── training/
│   ├── train_model.py             # Main training script
│   └── evaluation.py              # Performance metrics
├── inference/
│   ├── predict.py                 # FastAPI-ready inference function
├── configs/
│   └── model_config.yaml          # Hyperparameters
├── requirements.txt               # Dependencies
└── README.md                      # Documentation
```

## 🛠️ Installation

1. **Clone the project** and navigate to the root:
   ```bash
   cd project_root
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## 📊 Generating Synthetic Data

To simulate real-world signals (pharmacy sales, social posts, etc.), run:
```bash
python -m data.synthetic_data_generator
```
This generates `synthetic_outbreak_data.csv` with probabilistic outbreak spikes.

## 🏋️ Training the Model

Execute the training pipeline to build and save the TensorFlow model:
```bash
python -m training.train_model
```
The model will be saved in the `saved_models/` directory in **SavedModel** format.

## 🧠 Inference & FastAPI Integration

### Sample Usage
The `inference/predict.py` file provides the `predict_outbreak` function which takes a JSON input.

```python
from inference.predict import predict_outbreak

sample_input = {
    "search_queries": ["fever medicine", "flu symptoms"],
    "social_posts": ["Everyone in the city is coughing today"],
    "pharmacy_features": [120, 30, 20, 40, 80],
    "region_id": 4,
    "date_index": 200
}

result = predict_outbreak(sample_input)
print(result) # Output: {"outbreak_probability": 0.82, "risk_level": "HIGH"}
```

### Integration with FastAPI
In your FastAPI `main.py`, you can simply call this function:
```python
@app.post("/predict")
async def get_prediction(data: dict):
    return predict_outbreak(data)
```

## 🐳 Deployment with Docker

1. **Build the Image**:
   ```bash
   docker build -t outbreak-predictor-ai .
   ```

2. **Run the Container**:
   ```bash
   docker run -p 8000:8000 outbreak-predictor-ai
   ```

---
**Developed for Production AI environments using TensorFlow 2.x and TF-GNN.**

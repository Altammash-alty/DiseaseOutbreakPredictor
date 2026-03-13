import tensorflow as tf
import os
import yaml
import pandas as pd
import numpy as np
from project_root.models.outbreak_predictor import OutbreakPredictor
from project_root.pipeline.data_preprocessing import DataProcessor
from project_root.data.synthetic_data_generator import generate_synthetic_data

def train():
    # Load config
    with open("project_root/configs/model_config.yaml", "r") as f:
        config = yaml.safe_load(f)

    # 1. Generate/Load Data
    data_path = config['paths']['synthetic_data']
    if not os.path.exists(data_path):
        print("Generating synthetic dataset...")
        df = generate_synthetic_data(
            num_samples=config['data_params']['num_samples'],
            num_regions=config['model_params']['num_regions']
        )
    else:
        df = pd.read_csv(data_path)

    # 2. Preprocess Data
    processor = DataProcessor(model_name=config['model_params']['bert_model_name'])
    X_temporal, y = processor.create_sliding_windows(df, window_size=config['model_params']['temporal_window'])
    
    # 3. Build Graph
    graph = processor.build_graph_tensor(num_regions=config['model_params']['num_regions'])

    # 4. Initialize Model
    model = OutbreakPredictor(config)
    
    optimizer = tf.keras.optimizers.Adam(learning_rate=config['model_params']['learning_rate'])
    model.compile(
        optimizer=optimizer,
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC()]
    )

    # 5. Training Loop (Simplified)
    # In a full GNN implementation, we would repeat the graph tensor for batches
    print("Starting training...")
    # Mocking a batch training step since GNN + Batching requires specific TF-GNN Data Loaders
    model.fit(
        [X_temporal, tf.repeat(tf.expand_dims(graph, 0), repeats=X_temporal.shape[0], axis=0)],
        y,
        epochs=config['model_params']['epochs'],
        batch_size=config['model_params']['batch_size']
    )

    # 6. Save Model
    save_path = config['paths']['model_save_dir']
    os.makedirs(save_path, exist_ok=True)
    model.save(save_path)
    print(f"Model saved successfully to {save_path}")

if __name__ == "__main__":
    train()

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import os
import yaml
import pandas as pd
import numpy as np
import sys

# Add project root to path for local execution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from project_root.models.outbreak_predictor import OutbreakPredictor
from project_root.pipeline.data_preprocessing import DataProcessor
from project_root.data.synthetic_data_generator import generate_synthetic_data

def train():
    # Load config
    # Adjusted path for running from project_root or Electrothon root
    config_path = "project_root/configs/model_config.yaml"
    if not os.path.exists(config_path):
        config_path = "../configs/model_config.yaml" # If running from training dir
        
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    processor = DataProcessor(model_name=config['model_params']['bert_model_name'])

    # 1. Load Data
    real_data_path = config['paths'].get('real_data', "project_root/data/real_pharmacy_data.csv")
    if os.path.exists(real_data_path):
        print(f"Loading real city data from {real_data_path}...")
        df = processor.load_city_data(real_data_path, config)
    else:
        print("Real data not found. Falling back to synthetic data...")
        synth_path = config['paths']['synthetic_data']
        if not os.path.exists(synth_path):
            print("Generating synthetic dataset...")
            df = generate_synthetic_data(
                num_samples=config['data_params']['num_samples'],
                num_regions=config['model_params']['num_regions']
            )
        else:
            df = pd.read_csv(synth_path)

    # 2. Preprocess Data
    X_temporal, y = processor.create_sliding_windows(df, window_size=config['model_params']['temporal_window'])
    
    if X_temporal.shape[0] == 0:
        print("Error: No data windows created. Check your data source and window size.")
        return

    # 3. Build Graph Data
    x_gnn, edge_index = processor.build_graph_data(num_regions=config['model_params']['num_regions'])
    x_gnn = x_gnn.to(device)
    edge_index = edge_index.to(device)

    # 4. Initialize Model
    model = OutbreakPredictor(config).to(device)
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=config['model_params']['learning_rate'])

    # Create DataLoader
    dataset = TensorDataset(X_temporal, y)
    dataloader = DataLoader(dataset, batch_size=config['model_params']['batch_size'], shuffle=True)

    # 5. Training Loop
    print(f"Starting training on {device} with {len(X_temporal)} samples...")
    model.train()
    
    epochs = config['model_params']['epochs']
    for epoch in range(epochs):
        epoch_loss = 0
        correct = 0
        total = 0
        
        for batch_x, batch_y in dataloader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(batch_x, x_gnn, edge_index).squeeze()
            
            # Handle cases where batch_size is 1 (squeeze might remove batch dim if not careful)
            if outputs.dim() == 0:
                outputs = outputs.unsqueeze(0)
                
            loss = criterion(outputs, batch_y)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            predicted = (outputs > 0.5).float()
            total += batch_y.size(0)
            correct += (predicted == batch_y).float().sum().item()
            
        print(f"Epoch [{epoch+1}/{epochs}], Loss: {epoch_loss/len(dataloader):.4f}, Acc: {100*correct/total:.2f}%")

    # 6. Save Model
    save_path = config['paths']['model_save_dir']
    os.makedirs(save_path, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(save_path, "model.pth"))
    print(f"Model weights saved successfully to {save_path}/model.pth")

if __name__ == "__main__":
    train()

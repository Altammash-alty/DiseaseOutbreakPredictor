import pandas as pd
import numpy as np
import torch
from transformers import BertTokenizer

class DataProcessor:
    def __init__(self, model_name="bert-base-uncased", max_length=128):
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.max_length = max_length

    def preprocess_text(self, text_list):
        """
        Tokenizes text for BERT.
        """
        if isinstance(text_list, str):
            text_list = [text_list]
            
        encoded = self.tokenizer(
            text_list,
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )
        return encoded['input_ids'], encoded['attention_mask']

    def load_city_data(self, csv_path, config):
        """
        Loads and prepares real city-specific pharmacy data.
        """
        df = pd.read_csv(csv_path)
        city_map = config['model_params']['city_mapping']
        
        # Filter for known cities in mapping
        df = df[df['city'].isin(city_map.keys())].copy()
        
        # Map city names to IDs
        df['region_id'] = df['city'].map(city_map)
        
        # Extract the pharmacy features defined in config
        feature_cols = config['model_params']['pharmacy_feature_cols']
        
        # Convert to list format expected by the sliding widow logic
        df['pharmacy_features'] = df[feature_cols].values.tolist()
        
        return df

    def create_sliding_windows(self, df, window_size=7):
        """
        Creates temporal windows for LSTM.
        Expects df with region_id, pharmacy_features, etc.
        """
        X_temporal = []
        y = []
        
        # Group by region to preserve temporal continuity
        for region, group in df.groupby("region_id"):
            # Ensure chronological order if date information is present
            if 'date_index' in group.columns:
                group = group.sort_values('date_index')
            elif 'date' in group.columns:
                group = group.sort_values('date')
                
            # Pharmacy features are usually the main temporal signal
            features = np.stack(group['pharmacy_features'].values)
            
            # Ensure labels exist (outbreak_label)
            labels = group["outbreak_label"].values
            
            for i in range(len(features) - window_size):
                X_temporal.append(features[i : i + window_size])
                y.append(labels[i + window_size])
        
        if len(X_temporal) == 0:
            return torch.empty(0), torch.empty(0)
            
        return torch.tensor(np.array(X_temporal), dtype=torch.float32), torch.tensor(np.array(y), dtype=torch.float32)

    def build_graph_data(self, num_regions):
        """
        Builds graph data for PyTorch Geometric.
        Returns:
        - x: Node features [num_nodes, feature_dim]
        - edge_index: [2, num_edges]
        """
        # Node features (random initialization for demo)
        x = torch.randn((num_regions, 64))
        
        # Create a simple ring graph
        source = []
        target = []
        for i in range(num_regions):
            source.append(i)
            target.append((i + 1) % num_regions)
            # Make it undirected for demo
            source.append((i + 1) % num_regions)
            target.append(i)
            
        edge_index = torch.tensor([source, target], dtype=torch.long)
        
        return x, edge_index

import torch
import torch.nn as nn
from .lstm_temporal_model import LSTMTemporalModel
from .gnn_spatial_model import GNNSpatialModel

class OutbreakPredictor(nn.Module):
    """
    Complete Outbreak Prediction System.
    Fuses BERT embeddings, LSTM temporal representations, and GNN spatial propagation features.
    """
    def __init__(self, config):
        super(OutbreakPredictor, self).__init__()
        self.config = config
        
        # Temporal Component
        # pharmacy_features dimension is usually small (e.g., 5-10)
        # We'll assume input_dim is provided in config or use a default
        lstm_input_dim = config['model_params'].get('lstm_input_dim', 6)
        self.lstm_model = LSTMTemporalModel(
            input_dim=lstm_input_dim,
            units=config['model_params']['lstm_units'],
            dropout_rate=config['model_params']['dropout_rate']
        )
        
        # Spatial Component
        gnn_node_features = config['model_params'].get('gnn_node_features', 64)
        self.gnn_model = GNNSpatialModel(
            node_features=gnn_node_features,
            hidden_channels=config['model_params']['gnn_hidden_channels']
        )
        
        # Final Fusion Layers
        # LSTM output is 64 (fixed in lstm_temporal_model.py)
        # GNN output is gnn_hidden_channels
        fusion_input_dim = 64 + config['model_params']['gnn_hidden_channels']
        
        self.fusion_dense = nn.Linear(fusion_input_dim, 128)
        self.relu = nn.ReLU()
        self.batch_norm = nn.BatchNorm1d(128)
        self.dropout = nn.Dropout(0.3)
        self.output_layer = nn.Linear(128, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, temporal_input, x_gnn, edge_index):
        """
        Input structure:
        - temporal_input: (batch, time_steps, feature_dim)
        - x_gnn: Node feature matrix [num_nodes, node_features]
        - edge_index: Graph connectivity [2, num_edges]
        """
        
        # 1. Temporal feature extraction
        temporal_features = self.lstm_model(temporal_input)
        
        # 2. Spatial feature extraction
        spatial_features = self.gnn_model(x_gnn, edge_index)
        
        # 3. Feature Fusion
        # In this simplified demo, we'll assume we want prediction for all regions
        # or that the batch size matches the number of regions.
        # For a production scenario, we'd align regions properly.
        
        # If batch size doesn't match regions, we might need to repeat or select
        if temporal_features.shape[0] != spatial_features.shape[0]:
            # This is a simplification for the demo
            spatial_features = spatial_features.repeat(temporal_features.shape[0] // spatial_features.shape[0] + 1, 1)
            spatial_features = spatial_features[:temporal_features.shape[0]]

        combined_features = torch.cat([temporal_features, spatial_features], dim=-1)
        
        x = self.fusion_dense(combined_features)
        x = self.batch_norm(x)
        x = self.relu(x)
        x = self.dropout(x)
        
        return self.sigmoid(self.output_layer(x))

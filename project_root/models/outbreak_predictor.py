import torch
import torch.nn as nn
from .lstm_temporal_model import LSTMTemporalModel
from .gnn_spatial_model import GNNSpatialModel
from .bert_encoder import BertEncoder

class OutbreakPredictor(nn.Module):
    """
    Complete Outbreak Prediction System.
    Fuses BERT embeddings, LSTM temporal representations, and GNN spatial propagation features.
    """
    def __init__(self, config):
        super(OutbreakPredictor, self).__init__()
        self.config = config
        
        # 1. BERT Component (Semantic)
        self.bert_encoder = BertEncoder(model_name=config['model_params'].get('bert_model_name', "bert-base-uncased"))
        
        # 2. Temporal Component (History)
        lstm_input_dim = config['model_params'].get('lstm_input_dim', 5)
        self.lstm_model = LSTMTemporalModel(
            input_dim=lstm_input_dim,
            units=config['model_params']['lstm_units'],
            dropout_rate=config['model_params']['dropout_rate']
        )
        
        # 3. Spatial Component (Regional)
        gnn_node_features = config['model_params'].get('gnn_node_features', 64)
        self.gnn_model = GNNSpatialModel(
            node_features=gnn_node_features,
            hidden_channels=config['model_params']['gnn_hidden_channels']
        )
        
        # BERT output is 768, LSTM output is 64, GNN output is 64
        # Fusion Layers
        fusion_input_dim = 768 + 64 + config['model_params']['gnn_hidden_channels']
        
        self.fusion_dense = nn.Linear(fusion_input_dim, 256)
        self.relu = nn.ReLU()
        self.batch_norm = nn.BatchNorm1d(256)
        self.dropout = nn.Dropout(0.3)
        self.output_layer = nn.Linear(256, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, temporal_input, x_gnn, edge_index, bert_input_ids=None, bert_attention_mask=None):
        """
        Input structure:
        - temporal_input: (batch, time_steps, feature_dim)
        - x_gnn: Node feature matrix [num_nodes, node_features]
        - edge_index: Graph connectivity [2, num_edges]
        - bert_input_ids: (batch, seq_len)
        - bert_attention_mask: (batch, seq_len)
        """
        
        # 1. Temporal feature extraction
        temporal_features = self.lstm_model(temporal_input)
        
        # 2. Spatial feature extraction
        spatial_features = self.gnn_model(x_gnn, edge_index)
        
        # Align spatial features to batch size
        if temporal_features.shape[0] != spatial_features.shape[0]:
            spatial_features = spatial_features.repeat(temporal_features.shape[0] // spatial_features.shape[0] + 1, 1)
            spatial_features = spatial_features[:temporal_features.shape[0]]

        # 3. Semantic feature extraction (BERT)
        if bert_input_ids is not None:
            semantic_features = self.bert_encoder(bert_input_ids, bert_attention_mask)
        else:
            # Fallback to zeros if no text input provided
            semantic_features = torch.zeros((temporal_features.shape[0], 768)).to(temporal_features.device)

        # 4. Feature Fusion
        combined_features = torch.cat([semantic_features, temporal_features, spatial_features], dim=-1)
        
        x = self.fusion_dense(combined_features)
        x = self.batch_norm(x)
        x = self.relu(x)
        x = self.dropout(x)
        
        return self.sigmoid(self.output_layer(x))

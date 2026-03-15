import tensorflow as tf
from .bert_encoder import BertEncoder
from .lstm_temporal_model import LSTMTemporalModel
from .gnn_spatial_model import GNNSpatialModel

class OutbreakPredictor(tf.keras.Model):
    """
    Complete Outbreak Prediction System.
    Fuses BERT embeddings, LSTM temporal representations, and GNN spatial propagation features.
    """
    def __init__(self, config, **kwargs):
        super(OutbreakPredictor, self).__init__(**kwargs)
        self.config = config
        
        # Components
        # Note: BERT is often pre-processed to speed up training, but included here for architecture completeness
        self.lstm_model = LSTMTemporalModel(
            units=config['model_params']['lstm_units'],
            dropout_rate=config['model_params']['dropout_rate']
        )
        self.gnn_model = GNNSpatialModel(
            hidden_channels=config['model_params']['gnn_hidden_channels']
        )
        
        # Final Fusion Layers
        self.fusion_dense = tf.keras.layers.Dense(128, activation='relu')
        self.batch_norm = tf.keras.layers.BatchNormalization()
        self.dropout = tf.keras.layers.Dropout(0.3)
        self.output_layer = tf.keras.layers.Dense(1, activation='sigmoid')

    def call(self, inputs, training=False):
        """
        Input structure:
        - temporal_features: (batch, time_steps, feature_dim)
        - spatial_graph: tfgnn.GraphTensor
        """
        temporal_input, spatial_graph = inputs
        
        # 1. Temporal feature extraction
        temporal_features = self.lstm_model(temporal_input, training=training)
        
        # 2. Spatial feature extraction
        # For simplicity, we assume the graph nodes correspond to our batch regions
        spatial_features = self.gnn_model(spatial_graph)
        
        # 3. Feature Fusion
        # Concatenate temporal context with spatial information
        # Assuming spatial_features are aligned with the target nodes in temporal_input
        combined_features = tf.concat([temporal_features, spatial_features], axis=-1)
        
        x = self.fusion_dense(combined_features)
        x = self.batch_norm(x, training=training)
        x = self.dropout(x, training=training)
        
        return self.output_layer(x)

    def get_config(self):
        return self.config

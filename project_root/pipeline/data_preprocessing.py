import pandas as pd
import numpy as np
import tensorflow as tf
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
            return_tensors="tf"
        )
        return encoded['input_ids'], encoded['attention_mask']

    def create_sliding_windows(self, df, window_size=7):
        """
        Creates temporal windows for LSTM.
        Expects df with region_id, pharmacy_features, etc.
        """
        X_temporal = []
        y = []
        
        # Group by region to preserve temporal continuity
        for region, group in df.groupby("region_id"):
            features = group.drop(["date", "region_id", "outbreak_label", "search_queries", "social_posts"], axis=1)
            # Expand pharmacy_features if they are string-encoded
            features = np.stack(group['pharmacy_features'].apply(lambda x: eval(x) if isinstance(x, str) else x))
            
            labels = group["outbreak_label"].values
            
            for i in range(len(features) - window_size):
                X_temporal.append(features[i : i + window_size])
                y.append(labels[i + window_size])
                
        return np.array(X_temporal), np.array(y)

    def build_graph_tensor(self, num_regions, adjacency_matrix=None):
        """
        Builds a TF-GNN GraphTensor.
        In a real scenario, this would use geographic distances.
        """
        import tensorflow_gnn as tfgnn
        
        # Create a simple ring graph or fully connected for synthetic demo
        source = []
        target = []
        for i in range(num_regions):
            source.append(i)
            target.append((i + 1) % num_regions)
            
        return tfgnn.GraphTensor.from_pieces(
            node_sets={
                "regions": tfgnn.NodeSet.from_pieces(
                    features={tfgnn.HIDDEN_STATE: tf.random.normal([num_regions, 64])}
                )
            },
            edge_sets={
                "edges": tfgnn.EdgeSet.from_pieces(
                    adjacency=tfgnn.Adjacency.from_indices(
                        source=("regions", tf.constant(source)),
                        target=("regions", tf.constant(target))
                    )
                )
            }
        )

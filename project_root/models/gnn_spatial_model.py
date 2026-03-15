import tensorflow as tf
import tensorflow_gnn as tfgnn

class GNNSpatialModel(tf.keras.layers.Layer):
    """
    Graph Neural Network for regional spread modeling using TensorFlow-GNN.
    Nodes represent regions, and edges represent geographic/mobility links.
    """
    def __init__(self, hidden_channels=64, **kwargs):
        super(GNNSpatialModel, self).__init__(**kwargs)
        self.conv1 = tfgnn.keras.layers.GraphUpdate(
            node_sets={
                "regions": tfgnn.keras.layers.NodeSetUpdate(
                    {"edges": tfgnn.keras.layers.SimpleConvolution(
                        tf.keras.layers.Dense(hidden_channels, activation="relu"),
                        "sum"
                    )},
                    tfgnn.keras.layers.NextStateFromConcat(tf.keras.layers.Dense(hidden_channels))
                )
            }
        )
        self.conv2 = tfgnn.keras.layers.GraphUpdate(
            node_sets={
                "regions": tfgnn.keras.layers.NodeSetUpdate(
                    {"edges": tfgnn.keras.layers.SimpleConvolution(
                        tf.keras.layers.Dense(hidden_channels, activation="relu"),
                        "sum"
                    )},
                    tfgnn.keras.layers.NextStateFromConcat(tf.keras.layers.Dense(hidden_channels))
                )
            }
        )

    def call(self, graph):
        """
        Inputs: tfgnn.GraphTensor
        Outputs: Updated GraphTensor or specific node features
        """
        graph = self.conv1(graph)
        graph = self.conv2(graph)
        # Extract node features for the relevant regions
        return graph.node_sets["regions"][tfgnn.HIDDEN_STATE]

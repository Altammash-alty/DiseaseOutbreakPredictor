import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv

class GNNSpatialModel(nn.Module):
    """
    Graph Neural Network for regional spread modeling using PyTorch Geometric.
    Nodes represent regions, and edges represent geographic/mobility links.
    """
    def __init__(self, node_features, hidden_channels=64):
        super(GNNSpatialModel, self).__init__()
        self.conv1 = GCNConv(node_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.relu = nn.ReLU()

    def forward(self, x, edge_index):
        """
        Inputs: 
        - x: Node feature matrix [num_nodes, node_features]
        - edge_index: Graph connectivity [2, num_edges]
        
        Outputs: Updated node features
        """
        x = self.conv1(x, edge_index)
        x = self.relu(x)
        x = self.conv2(x, edge_index)
        x = self.relu(x)
        
        return x

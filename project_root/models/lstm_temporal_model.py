import torch
import torch.nn as nn

class LSTMTemporalModel(nn.Module):
    """
    LSTM-based model to capture temporal dependencies in disease signals.
    """
    def __init__(self, input_dim, units=[128, 64], dropout_rate=0.2):
        super(LSTMTemporalModel, self).__init__()
        self.lstm1 = nn.LSTM(input_dim, units[0], batch_first=True)
        self.dropout1 = nn.Dropout(dropout_rate)
        self.lstm2 = nn.LSTM(units[0], units[1], batch_first=True)
        self.dropout2 = nn.Dropout(dropout_rate)
        self.dense = nn.Linear(units[1], 64)
        self.relu = nn.ReLU()

    def forward(self, x):
        """
        Inputs shape: (batch_size, time_steps, feature_dim)
        """
        # LSTM 1
        x, _ = self.lstm1(x)
        x = self.dropout1(x)
        
        # LSTM 2 (take last sequence output)
        x, _ = self.lstm2(x)
        x = x[:, -1, :] # Last time step
        x = self.dropout2(x)
        
        x = self.relu(self.dense(x))
        return x

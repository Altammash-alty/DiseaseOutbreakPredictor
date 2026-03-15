import tensorflow as tf

class LSTMTemporalModel(tf.keras.layers.Layer):
    """
    LSTM-based model to capture temporal dependencies in disease signals.
    """
    def __init__(self, units=[128, 64], dropout_rate=0.2, **kwargs):
        super(LSTMTemporalModel, self).__init__(**kwargs)
        self.lstm1 = tf.keras.layers.LSTM(units[0], return_sequences=True)
        self.dropout1 = tf.keras.layers.Dropout(dropout_rate)
        self.lstm2 = tf.keras.layers.LSTM(units[1])
        self.dropout2 = tf.keras.layers.Dropout(dropout_rate)
        self.dense = tf.keras.layers.Dense(64, activation='relu')

    def call(self, inputs, training=False):
        """
        Inputs shape: (batch_size, time_steps, feature_dim)
        """
        x = self.lstm1(inputs)
        x = self.dropout1(x, training=training)
        x = self.lstm2(x)
        x = self.dropout2(x, training=training)
        return self.dense(x)

import tensorflow as tf
from transformers import BertTokenizer, TFBertModel
import numpy as np

class BertEncoder(tf.keras.layers.Layer):
    """
    BERT layer for extracting semantic embeddings from search queries and social posts.
    """
    def __init__(self, model_name="bert-base-uncased", **kwargs):
        super(BertEncoder, self).__init__(**kwargs)
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.bert = TFBertModel.from_pretrained(model_name)
        self.bert.trainable = False # Keep BERT frozen initially for efficiency

    def call(self, inputs):
        """
        Expects a batch of strings. 
        Note: In a pure Keras graph, we usually handle tokenization outside 
        or use a specific TF-op based tokenizer.
        """
        # Bert processing typically happens in a preprocessing pipeline
        # or via custom training loops. Here we define the BERT architecture.
        # This layer expects input_ids, attention_mask
        input_ids, attention_mask = inputs
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        # Use pooled output (CLS token representation)
        return outputs.pooler_output

def get_bert_embeddings(texts, tokenizer, model, max_length=128):
    """
    Helper function to generate embeddings for a list of texts.
    """
    encoded = tokenizer(
        texts, 
        padding=True, 
        truncation=True, 
        max_length=max_length, 
        return_tensors="tf"
    )
    outputs = model(encoded['input_ids'], attention_mask=encoded['attention_mask'])
    # Average the embeddings if multiple texts are provided
    return tf.reduce_mean(outputs.pooler_output, axis=0)

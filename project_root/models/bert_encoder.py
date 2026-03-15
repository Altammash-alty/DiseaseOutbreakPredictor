import torch
import torch.nn as nn
from transformers import BertTokenizer, BertModel

class BertEncoder(nn.Module):
    """
    BERT layer for extracting semantic embeddings from search queries and social posts.
    """
    def __init__(self, model_name="bert-base-uncased"):
        super(BertEncoder, self).__init__()
        self.tokenizer = BertTokenizer.from_pretrained(model_name)
        self.bert = BertModel.from_pretrained(model_name)
        # Keep BERT frozen initially for efficiency
        for param in self.bert.parameters():
            param.requires_grad = False

    def forward(self, input_ids, attention_mask):
        """
        Expects input_ids and attention_mask tensors.
        """
        outputs = self.bert(input_ids, attention_mask=attention_mask)
        # Use pooled output (CLS token representation)
        return outputs.pooler_output

def get_bert_embeddings(texts, tokenizer, model, max_length=128, device='cpu'):
    """
    Helper function to generate embeddings for a list of texts.
    """
    encoded = tokenizer(
        texts, 
        padding=True, 
        truncation=True, 
        max_length=max_length, 
        return_tensors="pt"
    ).to(device)
    
    with torch.no_grad():
        outputs = model(encoded['input_ids'], attention_mask=encoded['attention_mask'])
    
    # Average the embeddings if multiple texts are provided
    return torch.mean(outputs.pooler_output, dim=0)

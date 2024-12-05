from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image

model_id = "vikhyatk/moondream2"
revision = "2024-08-26"
model = AutoModelForCausalLM.from_pretrained(
    model_id, trust_remote_code=True, revision=revision
)
tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision)

image = Image.open("/Users/raexiong/Desktop/1.JPG")
enc_image = model.encode_image(image)
print(
    model.answer_question(
        enc_image,
        'This is a book cover. Please identify the book title and author. Return ONLY a JSON response in the format: {"title": "Book Title", "author": "Author Name"} without any markdown formatting.',
        tokenizer,
    )
)

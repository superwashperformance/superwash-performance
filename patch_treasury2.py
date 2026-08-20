with open("src/components/views/TreasuryView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("c.full_name || c.fullName", "c.fullName")
content = content.replace("c.document_id || c.documentId", "c.documentId")

with open("src/components/views/TreasuryView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

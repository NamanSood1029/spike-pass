# Renders public/sample-invoice.png: a synthetic supplier invoice, watermarked SAMPLE.
from PIL import Image, ImageDraw, ImageFont
F = "/System/Library/Fonts/Supplemental/"
def font(n, s): return ImageFont.truetype(F + n, s)
reg, bold, uni = "Arial.ttf", "Arial Bold.ttf", "Arial Unicode.ttf"
W, H = 1200, 1300
img = Image.new("RGB", (W, H), (252, 250, 245))
d = ImageDraw.Draw(img)
ink, mute, line = (30, 30, 35), (110, 110, 120), (200, 196, 186)

d.rectangle([0, 0, W, 150], fill=(122, 52, 28))
d.text((60, 38), "Kumhar Clay Crafts", font=font(bold, 46), fill="white")
d.text((60, 98), "Terracotta & hand-painted earthenware  ·  Molela, Rajsamand, Rajasthan", font=font(reg, 22), fill=(245, 225, 210))
d.text((W - 60, 50), "TAX INVOICE", font=font(bold, 34), fill="white", anchor="ra")

y = 190
d.text((60, y), "Invoice No.", font=font(reg, 22), fill=mute); d.text((260, y), "KCC/26-27/0412", font=font(bold, 24), fill=ink)
d.text((700, y), "Date", font=font(reg, 22), fill=mute); d.text((820, y), "02 Oct 2026", font=font(bold, 24), fill=ink)
y += 40
d.text((60, y), "GSTIN", font=font(reg, 22), fill=mute); d.text((260, y), "SAMPLE-NOT-A-REAL-GSTIN", font=font(reg, 22), fill=ink)
d.text((700, y), "Due", font=font(reg, 22), fill=mute); d.text((820, y), "16 Oct 2026", font=font(reg, 22), fill=ink)

y += 70
d.text((60, y), "BILL TO", font=font(bold, 20), fill=mute)
d.text((60, y + 32), "Meera's Diya House", font=font(bold, 28), fill=ink)
d.text((60, y + 72), "Shop 14, Johari Bazaar, Jaipur, Rajasthan 302003", font=font(reg, 22), fill=ink)

y += 150
cols = [60, 600, 800, 960]
d.rectangle([40, y, W - 40, y + 50], fill=(240, 234, 222))
for x, h in zip(cols, ["Item", "Qty", "Rate", "Amount"]):
    d.text((x if h == "Item" else x + 120, y + 13), h, font=font(bold, 22), fill=ink, anchor="la" if h == "Item" else "ra")
rows = [
    ("Hand-painted terracotta diya, Diwali set", "(medium, 4 in, assorted colours)", "2,000", "Rs. 180", "Rs. 3,60,000"),
    ("Kraft gift box with window, 5-diya", "(packaging)", "400", "Rs. 45", "Rs. 18,000"),
]
y += 70
for a, sub, q, r, amt in rows:
    d.text((60, y), a, font=font(reg, 24), fill=ink)
    d.text((60, y + 34), sub, font=font(reg, 20), fill=mute)
    d.text((cols[1] + 120, y), q, font=font(uni, 24), fill=ink, anchor="ra")
    d.text((cols[2] + 120, y), r, font=font(uni, 24), fill=ink, anchor="ra")
    d.text((cols[3] + 120, y), amt, font=font(uni, 24), fill=ink, anchor="ra")
    y += 90
    d.line([40, y - 14, W - 40, y - 14], fill=line, width=2)

y += 20
for k, v, b in [("Subtotal", "Rs. 3,78,000", False), ("GST @ 5%", "Rs. 18,900", False), ("Total payable", "Rs. 3,96,900", True)]:
    d.text((700, y), k, font=font(bold if b else reg, 26 if b else 24), fill=ink)
    d.text((cols[3] + 120, y), v, font=font(uni, 28 if b else 24), fill=ink, anchor="ra")
    y += 46

y += 40
d.text((60, y), "Dispatch: in two lots, 08 Oct and 15 Oct 2026, by road to Jaipur.", font=font(reg, 22), fill=ink)
d.text((60, y + 36), "Payment: bank transfer, 50% advance received.", font=font(reg, 22), fill=ink)
d.text((W - 60, y + 120), "for Kumhar Clay Crafts", font=font(reg, 22), fill=mute, anchor="ra")
d.text((W - 60, y + 160), "Authorised signatory", font=font(bold, 22), fill=ink, anchor="ra")

d.rectangle([0, H - 70, W, H], fill=(235, 230, 220))
d.text((W // 2, H - 35), "SYNTHETIC SAMPLE for a concept prototype. Not a real invoice, supplier or GSTIN.", font=font(bold, 22), fill=(150, 40, 30), anchor="mm")

# Diagonal SAMPLE watermark
wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
wd = ImageDraw.Draw(wm)
wd.text((W // 2, H // 2), "SAMPLE", font=font(bold, 260), fill=(200, 30, 30, 60), anchor="mm")
wm = wm.rotate(30, center=(W // 2, H // 2))
img = Image.alpha_composite(img.convert("RGBA"), wm).convert("RGB")
img.save("public/sample-invoice.png", optimize=True)
print("ok", img.size)

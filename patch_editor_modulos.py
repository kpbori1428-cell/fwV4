with open('framework/editor-app.js', 'r') as f:
    content = f.read()

# Add 'tarjeta' to available modules array
content = content.replace("const modulosDisponibles = ['estado', 'condicion', 'texto'];", "const modulosDisponibles = ['estado', 'condicion', 'texto', 'tarjeta'];")

with open('framework/editor-app.js', 'w') as f:
    f.write(content)

print("editor modules patched")

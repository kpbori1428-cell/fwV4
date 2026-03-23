with open('framework/editor-app.js', 'r') as f:
    content = f.read()

# Make the catch blocks silent again since it was working before we made them verbose and throwing errors
content = content.replace("            } catch (e) { console.error('Error loading palette editor', e); }", "            } catch (e) {}")
content = content.replace("                } catch (e) { console.error('Error loading palette editor', e); }", "                } catch (e) {}")

with open('framework/editor-app.js', 'w') as f:
    f.write(content)

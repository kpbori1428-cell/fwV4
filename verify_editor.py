import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1400, "height": 1080})

        await page.goto('http://localhost:3003/editor.html')
        await page.wait_for_selector('.nodo-arbol', timeout=5000)

        # Click the puerta node
        await page.evaluate("""
            const nodes = Array.from(document.querySelectorAll('.nodo-arbol'));
            const puertaNode = nodes.find(n => n.dataset.path === 'pagina.demo-estado.puerta');
            if (puertaNode) puertaNode.click();
        """)

        await page.wait_for_timeout(2000)

        # Scroll the inspector container
        await page.evaluate("document.querySelector('#inspector').scrollTop = 400")
        await page.wait_for_timeout(500)

        # Take a screenshot of the inspector
        await page.locator('#inspector').screenshot(path='/home/jules/verification/inspector-puerta-accordions.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())

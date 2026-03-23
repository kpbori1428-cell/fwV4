import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1400, "height": 1080})

        await page.goto('http://localhost:3003/editor.html')
        await page.wait_for_timeout(2000)

        # Click the puerta node
        await page.evaluate("""
            const nodes = Array.from(document.querySelectorAll('.nodo-arbol'));
            const puertaNode = nodes.find(n => n.dataset.path && n.dataset.path.includes('puerta'));
            if (puertaNode) puertaNode.click();
        """)

        await page.wait_for_timeout(1000)

        # Open accordion if not already opened
        await page.evaluate("""
            const btn = document.querySelector('.modulo-header-condicion');
            if(btn && !btn.parentElement.classList.contains('open')) {
                btn.click();
            }
            const insp = document.querySelector('#inspector');
            if(insp) insp.scrollTop = insp.scrollHeight;
        """)
        await page.wait_for_timeout(1000)

        # Take a screenshot of the right panel
        await page.locator('#inspector').screenshot(path='inspector-condicion-editor.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())

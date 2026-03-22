import { test, expect } from '@playwright/test';

test('Condicion with multiple states logic', async ({ page }) => {
  await page.goto('http://localhost:3003');

  // Locate switches
  const switch1 = page.locator('#pagina-demo-estado-grupo-switches-switch1');
  const switch2 = page.locator('#pagina-demo-estado-grupo-switches-switch2');
  const puerta = page.locator('#pagina-demo-estado-puerta');

  // Verify initial state
  await expect(puerta).toHaveText('PUERTA CERRADA (Enciende ambos switches)');
  await page.screenshot({ path: '/home/jules/verification/puerta-cerrada.png' });

  // Click switch 1
  await switch1.click();

  // Puerta should still be closed since switch 2 is off
  await expect(puerta).toHaveText('PUERTA CERRADA (Enciende ambos switches)');
  await page.screenshot({ path: '/home/jules/verification/puerta-cerrada-1.png' });

  // Click switch 2
  await switch2.click();

  // Puerta should now be open!
  await expect(puerta).toHaveText('PUERTA ABIERTA!');
  await page.screenshot({ path: '/home/jules/verification/puerta-abierta.png' });

  // Click switch 1 to turn it off
  await switch1.click();

  // Puerta should be closed again
  await expect(puerta).toHaveText('PUERTA CERRADA (Enciende ambos switches)');
  await page.screenshot({ path: '/home/jules/verification/puerta-cerrada-2.png' });

});
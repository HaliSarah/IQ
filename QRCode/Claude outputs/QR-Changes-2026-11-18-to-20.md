---
Title: QR Platform — Changes, Nov 18–20, 2026
Author: Hali Sarah Parsons
Date: 2026-11-20
Modified By: Claude
Description: Record of every change made to the QR Code Platform in this chat. Files changed: QRCode/index.html and QRCode/Features/index.html.
---

# QR Platform Changes: Nov 18–20, 2026

## Overall Shape (frame)
- **Heart clipping fix:** frame shapes are now drawn slightly in from the canvas edge, so the heart's lobes are no longer cut off. This applies to every frame shape.
- **Removed:** the four "Rounded · Point TL/TR/BR/BL" shapes, which looked too much like a square. Designs already saved with one still display.
- **Request an Overall Shape:** a new section under the Overall Shape picker on both tabs.
  - **$5** is a public shape added for everyone.
  - **$50** is an exclusive shape that is never shared and never made again for anyone else.
- **Delivering a $50 exclusive Overall Shape:** in Admin Tools, check **Use as Overall Shape** when assigning. The shape then shows only in that customer's Overall Shape picker.

## Exclusive guarantee log
- Every paid $50 request, dot or overall shape, saves only its key words (for example "pumpkin") to `exclusive_shape_log`. It stores no email or name.
- Before payment, both tiers check the log. A match within the same kind blocks the request: the customer is told nothing was charged, and the admin gets an email.
- The admin queue flags any request that matches an existing exclusive in red.
- **Add past $50 requests to exclusive log:** an admin button that backfills older requests. Click it once.
- The Firestore rule for `exclusive_shape_log` has been published (done in the browser).
- Limitation: only shared words match. "Jack-o-lantern" will not match "pumpkin."

## Dot color
- **Random:** a new Dot Color mode. It uses 2–10 colors, chosen from a dropdown, with a picker for each color.
  - **Shuffle** changes which dot gets which color.
  - Colors stay put while you edit, and they match in the PNG and paid SVG downloads.
  - The frame outline uses Color 1.

## Main dots
- **Orientation buttons** (Top Right / Bottom Right / Bottom Left / Top Left) for Crescent and the other orientable shapes now follow new click rules:
  - **Click** makes every dot face that way.
  - **Click again** undoes it, back to Top Right.
  - **Double-click** adds that direction to a random mix; double-clicking again takes it out.
  - This replaces the old behavior, where every click added another direction to a random mix.
- **Reflect Dots** (Vertical/Horizontal) was tried and then removed at Hali's request. The per-shape reflect toggles for character shapes are back. Designs saved during that window still render as saved.

## Corners (finder eyes)
- **Bug fix:** with Asymmetric on, changing one corner to Solid no longer turns the other corners black. This applies to both outer rings and inner dots.
- **Apply to all corners:** a button under Inner Dot Style, shown only when Asymmetric is on. It copies the current corner's inner dot shape, Crescent direction and reflect to all 3 corners.
- **Reflect Inner Dot:** always visible, with **Vertical** and **Horizontal** buttons, for every inner dot shape. With Asymmetric on, each corner gets its own setting ("this corner").

## Floating controls
- **Corner picker** (only when Asymmetric is on):
  - Desktop: stacked on the right side of the screen.
  - Phone: a row along the bottom.
- **Refresh Design / Undo:**
  - Desktop: side by side, top-left under the nav.
  - Phone: stacked, top-left.
- Both only show while their original controls are scrolled out of view.

## Features page
- The heading now reads "Every feature" on line 1 and "of the QR Code Platform" on line 2. Line 2 never wraps and shrinks slightly on phones.

## Cleanup
- Removed two `<script>` mentions inside code comments that browsers could misread. Checked the file for stray hidden characters; the only ones are joiners inside emoji, which are normal.

## Notes
- **Older copies saved over index.html:** older copies of `index.html` were being saved over new ones, which undid changes. If a Claude chat or an editor tab has the file open, close or reload it before working.
- **Seeing changes on the live site:** changes show only after pushing to GitHub and Cloudflare deploying. Hard refresh with Cmd + Shift + R.

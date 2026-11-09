# Paid customisation, version 7.1.2

## Fixed behaviour

Customise offers starter options and individually purchased cosmetics only. Hair colours, shirt trims and clubhouse colours now have priced Shop items. Curls and Wavy crop cost 5 credits; Touchline stripes costs 8. Starter brown hair, matched trim and Stadium green remain included. Skin tone, position and kit number remain freely editable identity choices.

Every paid equip path requires both inventory ownership and a valid positive-cost purchase receipt. Palette changes use the same guard as equipment. Buying charges once, and equipping an owned item never charges again. Shop previews do not alter the saved player.

Catalogue 5 preserves receipts and original costs from catalogues 1 to 4. The one-time wardrobe migration resets previously unpaid colours/styles to defaults, removes obsolete zero-cost style receipts, and preserves actual credit purchases, balance, learning data, XP and identity choices. Current backups reject unowned equipped items.

## Verification

- 144 automated tests pass, including all new paid choices, insufficient credits, forged inventory, zero-cost receipts, legacy upgrade, backup restoration and preview isolation.
- Module syntax, marketing build and Worker build pass.
- Browser: a fictional Year 1 player completed the warm-up with 2 independent and 10 helped answers, banking 22 XP and 12 total credits. A 5-credit black hair purchase changed the balance to 7 and unlocked only that colour; a 5-credit Curls purchase changed it to 2. Both remained equipped after reload, with no second debit.
- Browser: before purchase, Customise contained only starter options. After purchase, it contained starter plus the bought colour/style; unbought trims, patterns and clubhouse colours stayed unavailable.
- Desktop and 320px phone layouts checked. Phone document had equal client and scroll widths (305px including its scrollbar), and the dialog was 293px wide.
- Screenshots: screenshots/7.1.2-paid-customisation.png and screenshots/7.1.2-mobile-customisation.png.

Core fix checkpoint: 28416f92c3930c425e29de1da8d16ab5fb641378 on fix/paid-customisation. Release commit updates every module cache key and generated page to 7.1.2. Verify the PR checks and Pages deployment before reporting the version live.

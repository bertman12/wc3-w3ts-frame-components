# WC3-W3TS-utils

#### This library was created for learning purposes and for personal utility of having a centralized location for my utility functions. There is still plenty work to be done for organization and arguments once I get around to it.

Small collection of utility helpers for projects using W3TS (Warcraft III TypeScript, v3.x). Designed to be lightweight and easy to drop into your WC3 TypeScript projects to simplify common tasks (tables, math, cloning, timers, safe wrappers, etc.).

## Features

-   Safe wrappers for native WC3 APIs
-   Common math and clamp helpers
-   Table/object deep clone and merge
-   Timer helpers and simple schedulers
-   Small, dependency-free TypeScript utilities

## Installation

Copy the utils folder into your project or install via your package manager if published:

npm

```
npm install wc3-w3ts-utils
```

yarn

```
yarn add wc3-w3ts-utils
```

Or add the files directly to your W3TS project (recommended for custom Warcraft builds).

## Usage

Import only what you need:

```ts
import { delayedTimer, unitsInRange, applyForce, useTempEffect, getRelativeAngleToUnit } from "wc3-w3ts-utils";

function Rebuke() {
    //Blasts unit's near the archmage away, temporarily slowing them
    const t = Trigger.create();
    t.registerUnitEvent(this.hero, EVENT_UNIT_SPELL_EFFECT);
    triggerAction(t, ({ spellId, refId }) => {
        if (spellId !== WTS_Abilities.Rebuke) {
            return;
        }

        delayedTimer(0.5, () => {
            unitsInRange(this.hero.x, this.hero.y, 350, (unit) => {
                if (unit.isAlive() && unit.isEnemy(this.hero.owner)) {
                    //apply force
                    const forceAngle = getRelativeAngleToUnit(this.hero, unit);
                    applyForce(forceAngle, unit, 1800, { obeyPathing: true });
                    applyStun(1, { contextId: refId, effectId: "archmage-rebuke", unit: unit });
                    this.hero.damageTarget(unit.handle, 100, false, false, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_UNIVERSAL, WEAPON_TYPE_ROCK_HEAVY_BASH);
                }
            });
        });

        const effect = Effect.createAttachment("Units\\NightElf\\Wisp\\WispExplode.mdl", this.hero, "overhead");
        effect?.playWithTimeScale(ANIM_TYPE_BIRTH, 2);

        useTempEffect(effect);
    });
}
```

## Contributing

-   Open an issue for bugs or enhancement requests.
-   Fork, create a feature branch, and submit a PR with tests/examples where applicable.
-   Keep changes small and well-documented.

## License

MIT — see LICENSE file.

## Notes

Built to be simple and compatible with W3TS v3.x and Warcraft III modding workflows. Adjust imports when integrating directly into your map project. This library was created for learning purposes and for personal utility of having a centralized location for my utility functions. There is still work to be done for organization and arguments once I get around to it.

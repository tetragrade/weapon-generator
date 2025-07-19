import mkDemand from "./generators/demandGenerator";
import { defaultWeaponRarityConfigFactory } from "./generators/weaponGenerator/weaponGeneratorConfigLoader";
import { mkWeapon } from "./generators/weaponGenerator/weaponGeneratorLogic";
import { Weapon, weaponRarities, WeaponRarityConfig } from "./generators/weaponGenerator/weaponGeneratorTypes";
import { Nullable } from "./util/nullable";


interface WeaponView {
  root: HTMLElement;


  outputRoot: HTMLElement;

  name: HTMLElement;

  damage: HTMLElement;
  toHit: HTMLElement;
  active: {
    maxCharges: HTMLElement;
    rechargeMethod: HTMLElement;
    sentientWeaponsDemandsRecharge: HTMLElement;
    powers: HTMLElement;
  };

  passivePowers: HTMLElement;

  sentient: {
    main: HTMLElement;
    personality: HTMLElement;
    languages: HTMLElement;
    demands: {
      main: HTMLElement;
      chanceOfDemands: HTMLElement;
    }
  }
}

function isWeaponView(x: unknown): x is WeaponView {
  const wv = (x as WeaponView);
  return (
    wv !== null &&
    wv.root &&
    wv.outputRoot &&
    wv.name &&
    wv.damage &&
    wv.toHit &&
    wv.active &&
    wv.active.maxCharges &&
    wv.active.rechargeMethod &&
    wv.active.powers &&
    wv.passivePowers &&
    wv.sentient.main &&
    wv.sentient.personality &&
    wv.sentient.languages &&
    wv.sentient.demands.main &&
    wv.sentient.demands.chanceOfDemands
  ) ? true : false;
}

interface DemandGeneratorView {
  root: HTMLElement;
  outputRoot: HTMLElement;
  generateButton: HTMLElement;
}

function isDemandGeneratorView(x: unknown): x is DemandGeneratorView {
  const view = (x as DemandGeneratorView);
  return (
    view != null && view.root && view.outputRoot
  ) ? true : false
}

class DemandGeneratorController {
  view: unknown;
  boundWeaponGeneratorController: WeaponGeneratorController;

  boundGenerate?: (() => void);

  generate() {
    if (isDemandGeneratorView(this.view) && this.boundWeaponGeneratorController.weapon !== null) {
      try {
        this.view.outputRoot.innerText = mkDemand(this.boundWeaponGeneratorController.weapon);

        // fade the new value in
        if (this.view.outputRoot.classList.contains('fade-in-1')) {
          this.view.outputRoot.classList.remove('fade-in-1');
          this.view.outputRoot.classList.add('fade-in-2');
        }
        else {
          this.view.outputRoot.classList.remove('fade-in-2');
          this.view.outputRoot.classList.add('fade-in-1');
        }
      }
      catch (e) {
        this.view.outputRoot.hidden = true;
        console.error(e);
      }
    }
  }

  constructor(boundWeaponGeneratorController: WeaponGeneratorController) {
    this.boundWeaponGeneratorController = boundWeaponGeneratorController;
    // get the view's root if the parent view has been constructed correctly
    if (isWeaponView(boundWeaponGeneratorController?.view)) {
      const root = boundWeaponGeneratorController.view.root.querySelector('.weapon-demands-generator');
      if (root) {
        this.view = {
          root,
          outputRoot: root.querySelector('.weapon-demands-generator-content'),
          generateButton: root.querySelector('.weapon-demands-generator-button')
        }
        if (isDemandGeneratorView(this.view)) {
          this.view.outputRoot.innerText = '';

          // we have to bind this function and store it as a property so that add / remove event listener gets the same function reference
          this.boundGenerate = this.generate.bind(this);

          this.view.generateButton.addEventListener('click', this.boundGenerate);
        }
      }
      else {
        this.view = null;
      }
    }
    else {
      this.view = null;
    }
  }

  dispose() {
    if (isDemandGeneratorView(this?.view) && this.boundGenerate) {
      this.view.generateButton.removeEventListener('click', this.boundGenerate);
    }
  }
}

export class WeaponGeneratorController {
  view: unknown;
  demandGenerator: DemandGeneratorController | null;
  weaponRarityConfig: WeaponRarityConfig;
  weapon: Weapon | null;

  constructor(rootId: string) {
    this.weapon = null;
    this.weaponRarityConfig = defaultWeaponRarityConfigFactory();
    this.demandGenerator = null;

    const root = document.getElementById(rootId);
    if (root) {
      this.view = {
        root,
        outputRoot: root.querySelector('.weapon-generator-output') as HTMLElement,
        name: root.querySelector('.weapon-name') as HTMLElement,
        damage: root.querySelector('.weapon-damage') as HTMLElement,
        toHit: root.querySelector('.weapon-tohit') as HTMLElement,
        active: {
          maxCharges: root.querySelector('.weapon-active-powers-n-charges') as HTMLElement,
          rechargeMethod: root.querySelector('.weapon-active-powers-recharge-method') as HTMLElement,
          sentientWeaponsDemandsRecharge: root.querySelector('.weapon-active-powers-sentient-demands-recharge') as HTMLElement,

          powers: root.querySelector('.weapon-active-powers-root') as HTMLElement,
        },
        passivePowers: root.querySelector('.weapon-passive-powers-root') as HTMLElement,

        sentient: {
          main: root.querySelector(".weapon-is-sentient") as HTMLElement,
          personality: root.querySelector('.weapon-personality-root') as HTMLElement,
          languages: root.querySelector('.weapon-languages-root') as HTMLElement,
          demands: {
            main: root.querySelector('.weapon-demands-main') as HTMLElement,
            chanceOfDemands: root.querySelector('.weapon-chance-of-demands') as HTMLElement
          }
        }
      } satisfies Nullable<WeaponView>;
      root.querySelector('.generate-button')?.addEventListener('click', (() => {
        const rngSeed = (Math.floor(Math.random() * 10e19)).toString();

        // update the view with the weapon
        this.update(rngSeed);

        // and update the url params to point to its id
        window.history.pushState( //navigate back to main
          null,
          "",
          `?id=${rngSeed}`
        );
      }).bind(this));

      // init the view state with the weapon id in the initial url params (if there is one)
      this.onIDChanged();

      // then observe for any future changes in the url params,
      // updating the weapon view for the new params
      window.addEventListener('popstate', (() => {
        this.onIDChanged();
      }).bind(this));
    }
    else {
      throw new Error(`couldn't find weapon generator root with id ${rootId}`)
    }
  }

  textForCharges(c: number | string | 'at will') {
    if (c === 'at will') {
      return c;
    }
    if (typeof c === 'string') {
      return `charges ${c}`;
    }
    else {
      if (c == 1) {
        return '1 charge';
      }
      else {
        return `${c} charges`;
      }
    }
  }

  buildList<T>(root: HTMLElement, source: T[], action: (elem: HTMLElement, x: T) => void) {
    // hide the whole list if there are no elements
    if (root.parentElement) {
      root.parentElement.hidden = source.length === 0;
    }

    // update the list
    root.innerHTML = '';
    for (const x of source) {
      const elem = document.createElement("div");
      root.appendChild(elem);
      action(elem, x)
    }
  }

  protected onIDChanged() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get('id');
    if (currentId) {
      this.update(currentId);
    }
  }

  update(rngSeed: string) {
    if (isWeaponView(this.view)) {
      try {
        this.demandGenerator?.dispose();
        this.demandGenerator = new DemandGeneratorController(this);

        this.view.outputRoot.hidden = false;

        this.weapon = mkWeapon(rngSeed);

        this.view.name.innerText = this.weapon.name;
        // remove the old rarity class & add the new one
        this.view.name.classList.remove(...weaponRarities.map(x => `weapon-rarity-${x}`));
        this.view.name.classList.add(`weapon-rarity-${this.weapon.rarity}`);

        // add damage
        const acc = `as ${this.weapon.damage.as}`;
        const damageKeys = (Object.keys(this.weapon.damage) as [keyof typeof this.weapon['damage']])
          .filter(k => k != 'as')
          .sort((k1, k2) => {
            const ord = ['d20', 'd12', 'd10', 'd8', 'd6', 'd4', 'const'];
            return ord.findIndex(x => x === k1) - ord.findIndex(x => x === k2)
          });
        this.view.damage.innerText = damageKeys.length > 0 ?
          damageKeys.reduce<string>(
            (acc, k) => (this?.weapon?.damage[k] ?? 0) > 0 ? (acc + ` + ${this?.weapon?.damage[k]}${k === 'const' ? '' : k}`) : acc,
            acc
          ) : acc;

        // add tohit
        this.view.toHit.innerText = '';
        if (this.weapon.toHit > 0) {
          this.view.toHit.innerText = ` (+${this.weapon.toHit} to hit)`;
        }

        // add the active powers
        this.view.active.maxCharges.innerText = `${this.textForCharges(this.weapon.active.maxCharges)}.`;
        this.view.active.rechargeMethod.innerText = (this.weapon.active.rechargeMethod.desc as string);
        this.buildList(
          this.view.active.powers,
          this.weapon.active.powers,
          (elem, x) => {
            elem.classList.add('weapon-generator-active-list-item');

            const descNode = document.createElement('p');
            descNode.innerText = `${(x.desc as string).capFirst()} (${this.textForCharges(x.cost)}).`;
            elem.appendChild(descNode);

            if (x.additionalNotes && x.additionalNotes.length > 0) {
              const additionalContainer = document.createElement('div');
              elem.appendChild(additionalContainer);
              for (const additionalNote of x.additionalNotes) {
                const additionalNode = document.createElement('p');
                additionalNode.innerText = additionalNote as string;
                additionalNode.classList.add('weapon-generator-active-list-item');
                additionalContainer.appendChild(additionalNode);
              }
            }
          }
        );

        // add the passive powers
        this.buildList(
          this.view.passivePowers,
          this.weapon.passivePowers.filter(x => x.desc !== null),
          (elem, x) => {
            elem.innerText = x.desc as string;
            elem.classList.add('weapon-generator-active-list-item');
          }
        );

        // add sentient box & info
        this.view.sentient.main.hidden = !this.weapon.sentient;
        this.view.active.sentientWeaponsDemandsRecharge.hidden = !this.weapon.sentient;

        if (this.weapon.sentient) {
          this.buildList(this.view.sentient.languages, this.weapon.sentient.languages, (elem, x) => {
            elem.innerText = x;
            elem.classList.add('weapon-generator-active-list-item');
          });
          this.buildList(this.view.sentient.personality, this.weapon.sentient.personality, (elem, x) => {
            elem.innerText = x.desc as string;
            elem.classList.add('weapon-generator-active-list-item');
          });

          this.view.sentient.demands.main.hidden = this.weapon.active.powers.length === 0;
          if (this.weapon.active.powers.length !== 0) {
            this.view.sentient.demands.chanceOfDemands.innerText = this.weapon.sentient.chanceOfMakingDemands.toString();
          }
        }
        else {
          this.view.sentient.languages.innerHTML = '';
          this.view.sentient.personality.innerHTML = '';
        }
      }
      catch (e) {
        this.view.outputRoot.hidden = true;
        console.error(e);
      }
    }
    else {
      throw new Error("couldn't get display");
    }
  }
}
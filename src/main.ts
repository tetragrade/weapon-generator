import './choice.ts';
import { WEAPON_GENERATOR } from './generators/weapon_generator.ts';

type Nullable<T extends object> = {[k in keyof T]: T[k] extends object ? (Nullable<T[k]> | null) : (T[k] | null)}; 

interface WeaponView {
  root: HTMLElement;

  
  outputRoot: HTMLElement;

  name: HTMLElement;

  damage: HTMLElement;
  active: {
    maxCharges: HTMLElement;
    rechargeMethod: HTMLElement;
    powers: HTMLElement;
  };
  
  passivePowers: HTMLElement;
  
  isSentient: HTMLElement;
  personality: HTMLElement;
  languages: HTMLElement;
}

function isWeaponView(x: unknown): x is WeaponView {
  const wv = (x as WeaponView);
  return (
    wv !== null && 
    wv.root &&
    wv.outputRoot && 
    wv.name &&
    wv.damage && 
    wv.active &&
    wv.active.maxCharges && 
    wv.active.rechargeMethod && 
    wv.active.powers &&  
    wv.passivePowers &&
    wv.isSentient && 
    wv.personality && 
    wv.languages
  ) ? true : false;
}

class WeaponGeneratorController {
  view: unknown;

  constructor(rootId: string) {
    const root = document.getElementById(rootId);
    if(root) {
      this.view = {
        root: root,
        outputRoot: root.querySelector('.weapon-generator-output') as HTMLElement,
        name: root.querySelector('.weapon-name') as HTMLElement,
        damage: root.querySelector('.weapon-damage') as HTMLElement,
        active: {
          maxCharges: root.querySelector('.weapon-active-powers-n-charges') as HTMLElement,
          rechargeMethod: root.querySelector('.weapon-active-powers-recharge-method') as HTMLElement,
          powers: root.querySelector('.weapon-active-powers-root') as HTMLElement,
        },
        passivePowers: root.querySelector('.weapon-passive-powers-root') as HTMLElement,
        
        isSentient: root.querySelector(".weapon-is-sentient") as HTMLElement,
        personality: root.querySelector('.weapon-personality-root') as HTMLElement,
        languages: root.querySelector('.weapon-languages-root') as HTMLElement,
      } satisfies Nullable<WeaponView>;
      root.querySelector('.generate-button')?.addEventListener('click', this.update.bind(this));
    }
    else {
      throw new Error(`couldn't find weapon generator root with id ${rootId}`)
    }
  }

  textForCharges(n: number | 'at will') {
    if(n === 'at will') {
      return n;
    }
    else {
      if(n == 1) {
        return '1 charge';
      }
      else {
        return `${n} charges`;
      }
    }
  }
  
  buildList<T>(root: HTMLElement, source: T[], action: (elem: HTMLElement, x: T) => void) {
    // hide the whole list if there are no elements
    if(root.parentElement) {
      root.hidden = source.length==0;
    }

    // update the list
    root.innerHTML = '';
    for(const x of source) {
      const elem = document.createElement("div");
      root.appendChild(elem);
      action(elem, x)
    }
  }
  
  update() {
    if(isWeaponView(this.view)) {
      try {
        this.view.outputRoot.hidden = false;
        const weaponViewModel = WEAPON_GENERATOR(Math.random() * 1000);
        console.log(weaponViewModel);
  
        this.view.name.innerText = weaponViewModel.name;
  
        const damageEntries = Object.entries(weaponViewModel.damage);
        this.view.damage.innerText = damageEntries.length>1 ?
          damageEntries
          .filter(([k]) => k!='d4')
          .slice(1)
          .reduce<string>(
            (acc, [k,v]) => acc + ` + ${v}${k}`, 
            `${damageEntries[0][1]}${damageEntries[0][0]}`
          ) : `${damageEntries[0][1]}${damageEntries[0][0]}`;
  
        // add the active powers
        this.view.active.maxCharges.innerText = `${this.textForCharges(weaponViewModel.active.maxCharges)}.`;
        this.view.active.rechargeMethod.innerText = weaponViewModel.active.rechargeMethod.capFirst() + '.';
        this.buildList(
          this.view.active.powers, 
          weaponViewModel.active.powers,
          (elem, x) => {
            elem.classList.add('weapon-generator-active-list-item');

            const desc = typeof(x.desc) === 'string' ? x.desc : x.desc.generate();

            const descNode = document.createElement('p');
            descNode.innerText  = `${desc.capFirst()} (${this.textForCharges(x.cost)}).`; 
            elem.appendChild(descNode);
            
            if(x.additionalNotes && x.additionalNotes.length > 0) {
              const additionalContainer = document.createElement('div');
              elem.appendChild(additionalContainer);
              for(const additionalNote of x.additionalNotes) {
                const additionalNode = document.createElement('p');
                additionalNode.innerText = additionalNote; 
                additionalNode.classList.add('weapon-generator-active-list-item');
                additionalContainer.appendChild(additionalNode);
              }
            }
          }
        );
        
        // add the passive powers
        this.buildList(
          this.view.passivePowers,
          weaponViewModel.passivePowers,
          (elem, x) => {
            elem.innerText = typeof(x.desc) === 'string' ? x.desc : x.desc.generate();
            elem.classList.add('weapon-generator-active-list-item');
          }
        );
        
        // add sentient box & info
        if(weaponViewModel.isSentient) {
          this.view.isSentient.hidden = false;
          this.buildList(this.view.languages, weaponViewModel.languages, (elem, x) => {
            elem.innerText = x;
            elem.classList.add('weapon-generator-active-list-item');
          });
          this.buildList(this.view.personality, weaponViewModel.personalityTraits, (elem, x) => {
            elem.innerText = x;
            elem.classList.add('weapon-generator-active-list-item');
          });
        }
        else {
          this.view.isSentient.hidden = true;
          this.view.languages.innerHTML = '';
          this.view.personality.innerHTML = '';
        }
      }
      catch(e) {
        this.view.outputRoot.hidden = true;
        console.error(e);
      }
    }
    else {
      throw new Error("couldn't get display");
    }
  }
}

console.log('loaded');
new WeaponGeneratorController("main-generator");
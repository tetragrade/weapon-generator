import './choice.ts';
import { WEAPON_GENERATOR } from './generators/weapon_generator.ts';

interface WeaponView {
  root: HTMLElement;

  
  outputRoot: HTMLElement;

  name: HTMLElement;
  description: HTMLElement;

  damage: HTMLElement;
  activePowers: HTMLElement;
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
    wv.description &&
    wv.damage && 
    wv.activePowers && 
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
        outputRoot: root.querySelector('.weapon-generator-output'),
        name: root.querySelector('.weapon-name'),
        description: root.querySelector('.weapon-description'),
        damage: root.querySelector('.weapon-damage'),
        activePowers: root.querySelector('.weapon-active-powers-root'),
        passivePowers: root.querySelector('.weapon-passive-powers-root'),
        
        isSentient: root.querySelector(".weapon-is-sentient"),
        personality: root.querySelector('.weapon-personality-root'),
        languages: root.querySelector('.weapon-languages-root'),
      };
      root.querySelector('.generate-button')?.addEventListener('click', this.update.bind(this));
    }
    else {
      throw new Error(`couldn't find weapon generator root with id ${rootId}`)
    }
  }
  
  buildList(root: HTMLElement, source: string[]) {
    root.innerHTML = '';
    for(const x of source) {
      const elem = document.createElement("li");
      elem.innerText = x;
      root.appendChild(elem);
    }
  }
  
  update() {
    console.log('this',this);
    if(isWeaponView(this.view)) {
      try {
        this.view.outputRoot.hidden = false;
        const weaponViewModel = WEAPON_GENERATOR(Math.random() * 1000);
  
        this.view.name.innerText = weaponViewModel.name;
        this.view.description.innerText = weaponViewModel.description;
  
        const damageEntries = Object.entries(weaponViewModel.damage);
        this.view.damage.innerText = damageEntries.length>1 ?
          damageEntries
          .filter(([k]) => k!='d4')
          .slice(1)
          .reduce<string>(
            (acc, [k,v]) => acc + ` + ${v}${k}`, 
            `${damageEntries[0][1]}${damageEntries[0][0]}`
          ) : `${damageEntries[0][1]}${damageEntries[0][0]}`;
  
        this.buildList(this.view.activePowers, weaponViewModel.activePowers.map(x => typeof(x.desc) === 'string' ? x.desc : x.desc.generate()));
        this.buildList(this.view.passivePowers, weaponViewModel.passivePowers.map(x => typeof(x.desc) === 'string' ? x.desc : x.desc.generate()));
        if(weaponViewModel.isSentient) {
          this.view.isSentient.hidden = false;
          this.buildList(this.view.languages, weaponViewModel.languages);
          this.buildList(this.view.personality, weaponViewModel.personalityTraits);
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

new WeaponGeneratorController("main-generator");
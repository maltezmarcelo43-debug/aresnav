import {describe,it,expect} from 'vitest';
import {RADIUS_KM,normalizeLon,distance,simulate,exampleMission,geodesic,missionSchema} from '../lib/mission';
describe('Reglas de planificación marciana',()=>{
 it('usa radio medio marciano de 3389,5 km',()=>{expect(RADIUS_KM).toBe(3389.5);expect(distance({name:'a',lat:0,lon:0},{name:'b',lat:0,lon:90})).toBeCloseTo(3389.5*Math.PI/2,5);});
 it('normaliza longitudes positivas hacia el este',()=>{expect(normalizeLon(359)).toBe(-1);expect(normalizeLon(181)).toBe(-179);});
 it('resuelve recorridos que cruzan ±180 sin dar la vuelta al planeta',()=>{const a={name:'a',lat:0,lon:179},b={name:'b',lat:0,lon:-179};expect(distance(a,b)).toBeCloseTo(3389.5*Math.PI/90,3);const line=geodesic(a,b);expect(Math.abs((line[64]?.[0]??0)-(line[0]?.[0]??0))).toBeCloseTo(2);});
 it('carga demostración de dos tripulantes en Jezero',()=>{const m=exampleMission();expect(m.crew).toBe(2);expect(m.base.lat).toBe(18.4447);expect(m.source).toBe('Datos de demostración');});
 it('incluye el regreso a base en distancia y recursos',()=>{const m={...exampleMission(),stops:[]};const one=simulate({...m,returnBase:false}),both=simulate({...m,returnBase:true});expect(both.km).toBeCloseTo(one.km*2);expect(both.resources[0]?.used).toBeCloseTo(both.hours*2*.5);});
 it('no inventa consumos cuando falta la tasa',()=>{const m=exampleMission();m.water.rate=null;expect(simulate(m).resources[0]?.used).toBeNull();});
 it('actualiza resultados al cambiar coordenadas',()=>{const m=exampleMission();expect(simulate({...m,destination:{name:'Lejos',lat:0,lon:0}}).km).toBeGreaterThan(simulate(m).km*100);});
 it('marca recursos y margen insuficientes',()=>{const m=exampleMission();m.water.available=0;m.maxHours=.01;expect(simulate(m).warnings).toContain('Recurso insuficiente: agua');expect(simulate(m).warnings).toContain('Tiempo insuficiente para conservar el margen de regreso');});
 it('fuera de datos de terreno usa aproximación no evaluada',()=>{const m=exampleMission();m.destination={name:'Otra región',lat:-50,lon:180};expect(simulate(m).evaluated).toBe(false);});
 it('valida velocidades y coordenadas importadas',()=>{expect(missionSchema.safeParse({...exampleMission(),speed:0}).success).toBe(false);expect(missionSchema.safeParse({...exampleMission(),destination:{name:'x',lat:91,lon:0}}).success).toBe(false);});
 it('calcula costos solo con precios ingresados',()=>{const m=exampleMission();m.water.price=3;const r=simulate(m);expect(r.cost).toBeCloseTo((r.resources[0]?.used??0)*3);});
 it('usa A* cuando una red utilizable cubre la misión',()=>{const m={...exampleMission(),stops:[],returnBase:false};m.nodes=[{...m.base,id:'a',neighbors:['b'],elevation:0},{...m.destination,id:'b',neighbors:['a'],elevation:15}];expect(simulate(m).evaluated).toBe(true);});
});
declare module 'a-star' {
 export default function aStar<T>(params: {start:T;isEnd:(n:T)=>boolean;neighbor:(n:T)=>T[];distance:(a:T,b:T)=>number;heuristic:(n:T)=>number;hash:(n:T)=>string;timeout?:number}): {status:string;cost:number;path:T[]};
}

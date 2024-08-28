import { inject, Injectable } from '@angular/core';
import { environement } from '../../environnement/environnement.developments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_USER_URL = environement.apiUser;

@Injectable({
  providedIn: 'root'
})
export class ApiUserService {
  private http: HttpClient = inject(HttpClient);
  fetchUser(startIndex: Number, limit: Number) : Observable<any>{
    return this.http.get(API_USER_URL+`?offset=${startIndex}&limit=50`);
  }
  fetchPokemonDetail(url: string, startIndex: Number, limit: Number)  : Observable<any>{
    return this.http.get(url+`?offset=${startIndex}&limit=50`);
  }
  fetchPokemonDetailCard(url: number) : Observable<any>{
    return this.http.get(API_USER_URL+'/'+url);
  }
  fetchPokemonDetailCardText(url: string) : Observable<any>{
    return this.http.get(API_USER_URL+'/'+url);
  }
  fetchPokemonDetailCardSpecies(url: string) : Observable<any>{
    return this.http.get(url);
  }
  fetchPokemonDetailCardHabitat(url: string) : Observable<any>{
    return this.http.get(url);
  }
  fetchPokemonDetailCardEvolution(url: string) : Observable<any>{
    return this.http.get(url);
  }

  constructor() { }
}

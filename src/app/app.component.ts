import { ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from './partials/footer/footer.component';
import { HeaderComponent } from './partials/header/header.component';
import { CommonModule, NgForOf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiUserService } from './services/api-user.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { HostListener } from '@angular/core';

interface DetailedPokemon {
  id: number;
  name: string;
  image: string; // URL to the Pokémon's image
  imageShiny: string;
  type: string[]; // Array of Pokémon types
  weight: number;
  isShiny: boolean;
}

interface PokemonDetailCard {
  id: string;
  name: string;
  species: string;
  image: string;
  imageShiny: string;
  types: string[];
  attack: string[];
  gameSprite: string;
  weight: number;
  height: number;
  abilities: string[];

  generation?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
  habitat?: string;
  habitat_url?: string;

  evolution?: string;
  previous_evolution?: string;
  evolution_image?: string;
  previous_evolution_image?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NgForOf, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

  export class AppComponent implements OnInit{


    constructor(private elRef: ElementRef) {}
    

    title = 'pokemon-gallery';
    showCard: boolean = false;
    isShiny: boolean = false;
    currentPage: number = 1;
    itemsPerPage: number = 50;
    totalItems: number = 0; 
    declare evolution: string;
    pokemonId: number = 0;
    additionCard: boolean = false;

    public pokemons: DetailedPokemon[] = []; // Array to store detailed Pokémon information
    public pokemonsCard: PokemonDetailCard[] = [] // Detailed information of the Pokémon card to display

    private apiService: ApiUserService = inject(ApiUserService);


    ngOnInit(): void {



      this.fetchPage(this.currentPage);

    }

    fetchPage(page: number): void {
      // Réinitialiser la liste des Pokémon affichés ici
      // Par exemple, si vous avez une liste nommée `displayedPokemons`, vous pourriez faire :
      this.pokemons = [];
    
      // Calculate the slice of data to fetch based on the current page and items per page
      const startIndex = 50* (page-1);
      const limit = 50;
    
      this.apiService.fetchUser(startIndex, limit).subscribe({
        next: (data) => {
          // For each Pokémon in the results, fetch its detailed information
          data.results.forEach((pokemon: { name: string; url: string }) => {
            this.fetchPokemonDetail(pokemon.url, 0, 50);
          });
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
    }


  


    async fetchPokemonDetail(url: string, startIndex: number, limit: number): Promise<void> {
      try {
        // Convert the Observable to a Promise using firstValueFrom
        const detail = await firstValueFrom(this.apiService.fetchPokemonDetail(url, startIndex, 50));
        const pokemonDetail: DetailedPokemon = {
          id: detail.id,
          name: detail.name,
          image: detail.sprites.other["official-artwork"].front_default,
          imageShiny: detail.sprites.other["official-artwork"].front_shiny,
          type: detail.types.map((t: { type: { name: string } }) => t.type.name),
          weight: detail.weight,
          isShiny: false
        };
        this.pokemons.push(pokemonDetail);
        // Sort pokemons array by id in ascending order
        this.pokemons.sort((a, b) => a.id - b.id);
      } catch (error) {
        console.error('Error fetching Pokémon details:', error);
      }
    }

    getTypeColor(type: string): string {
      const typeColors: {[key: string]: string} = {
        fire: '#F08030',
        water: '#6890F0',
        grass: '#78C850',
        normal: '#A8A878',
        poison: '#A040A0',
        electric: '#F8D030',
        ground: '#E0C068',
        fairy: '#EE99AC',
        fighting: '#C03028',
        psychic: '#F85888',
        rock: '#B8A038',
        ghost: '#705898',
        ice: '#98D8D8',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        flying: '#A890F0',
        bug: '#A8B820',
// Il en manque?
      };
      return typeColors[type] || '#FFFFFF'; // Couleur defaut invisible ducou
    }

    getHabitatPicture(habitat: string): string {
      const habitatPictures: {[key: string]: string} = {
        grassland: 'https://pics.craiyon.com/2023-12-05/jeR-wXkaTWeDD1kiUkFtMA.webp',
        forest: 'url_to_forest_image',
        desert: 'url_to_desert_image',
        mountain: 'url_to_mountain_image',
        cave: 'url_to_cave_image',
        sea: 'url_to_sea_image',
        urban: 'url_to_urban_image',
        // Add more habitats as needed
      };
      return habitatPictures[habitat] || 'default_image_url'; // Default image if habitat not found
    }

    nextPage(): void {
      this.currentPage++;
      this.fetchPage(this.currentPage);
    }

    previousPage(): void {
      this.currentPage--;
      this.fetchPage(this.currentPage);
    }

    openPokemonCard(pokemonId: number): void {
      this.apiService.fetchPokemonDetailCard(pokemonId).subscribe({
        next: (detail) => {
          const pokemonContentCard: PokemonDetailCard = {
            id: detail.id,
            name: detail.name,
            species: detail.species.url,
            image: detail.sprites.other["official-artwork"].front_default,
            imageShiny: detail.sprites.other["official-artwork"].front_shiny,
            types: detail.types.map((t: { type: { name: string } }) => t.type.name),
            attack: detail.moves.map((m: { move: { name: string } }) => m.move.name),
            gameSprite: "test",
            weight: detail.weight,
            height: detail.height,
            abilities: detail.abilities.map((a: { ability: { name: string } }) => a.ability.name),
          };
    
          this.pokemonId = detail.id;
    
          // Now, make the second API call using the species URL obtained from the first call
          this.apiService.fetchPokemonDetailCardSpecies(detail.species.url).subscribe({
            next: (speciesDetail) => {
              // Merge the species details into pokemonContentCard
              pokemonContentCard['generation'] = speciesDetail.generation.name;
              pokemonContentCard['isLegendary'] = speciesDetail.is_legendary;
              pokemonContentCard['isMythical'] = speciesDetail.is_mythical;
              pokemonContentCard['isBaby'] = speciesDetail.is_baby;
              pokemonContentCard['habitat'] = speciesDetail.habitat ? speciesDetail.habitat.name : 'Unknown'; // Handle possible null habitat
              const evolutionUrl = speciesDetail.evolution_chain.url;
    
              // Make sure to call fetchPokemonDetailCardEvolution inside the subscription
              this.apiService.fetchPokemonDetailCardEvolution(evolutionUrl).subscribe({
                next: (speciesEvolution) => {

                  const { previous, next } = findEvolutionDetails(this.pokemonId, speciesEvolution);
                  pokemonContentCard['evolution'] = next;
                  pokemonContentCard['previous_evolution'] = previous;

                  if (next == "None"  && previous == "None") {
                    if(this.additionCard === false){
                    this.pokemonsCard = [pokemonContentCard];
                  }
                  else {
                    this.pokemonsCard.push(pokemonContentCard);
                  }
                  }

                  if (next !== "None") {
                  this.apiService.fetchPokemonDetailCardText(next).subscribe({
                    next: (speciesEvolution) => {
                      
                      pokemonContentCard['evolution_image'] =  speciesEvolution.sprites.other["official-artwork"].front_default ;
                      
                      if(previous === "None")
                        if(this.additionCard === false){
                          this.pokemonsCard = [pokemonContentCard];
                        }
                        else {
                          this.pokemonsCard.push(pokemonContentCard);
                        }
                    },
                    error: (error) => console.error('Error fetching Pokémon species details:', error),
                  });
                }

                if (previous !== "None") {
                  this.apiService.fetchPokemonDetailCardText(previous).subscribe({
                    next: (speciesEvolution) => {
                     
                      pokemonContentCard['previous_evolution_image'] =  speciesEvolution.sprites.other["official-artwork"].front_default ;
                      if(this.additionCard === false){
                        this.pokemonsCard = [pokemonContentCard];
                      }
                      else {
                        this.pokemonsCard.push(pokemonContentCard);
                      }
                    },
                    error: (error) => console.error('Error fetching Pokémon species details:', error),
                  });
                }

                },
                error: (error) => console.error('Error fetching Pokémon species details:', error),
              });
            },
            error: (error) => console.error('Error fetching Pokémon species details:', error),
          });
        },
        error: (error) => console.error('Error fetching Pokémon card details:', error),
      });
      
      this.showCard = true;
    }

    closePokemonCard(): void {
      this.showCard = false;
    }

    AdditionalCard() {
      this.showCard = false;
    }
    

  }
  
  function findEvolutionDetails(currentPokemonId: number, evolutionChain: any) {
    let current = evolutionChain.chain;
    let previous = "None";
    let next = "None";
  
    // Fonction récursive pour parcourir la chaîne d'évolution
    function traverseChain(chain: any) {
      // Extraire l'ID du Pokémon de l'URL
      const speciesId = parseInt(chain.species.url.split('/').filter(Boolean).pop());
  
      if (speciesId === currentPokemonId) {
        // Si l'ID correspond, vérifier s'il y a une évolution suivante
        if (chain.evolves_to.length > 0) {
          next = chain.evolves_to[0].species.name; // Prendre la première évolution suivante
        }
        return true; // Trouvé le Pokémon actuel
      }
  
      for (let i = 0; i < chain.evolves_to.length; i++) {
        previous = chain.species.name; // Définir l'évolution précédente
        if (traverseChain(chain.evolves_to[i])) {
          return true;
        }
        // Si le Pokémon actuel n'est pas trouvé dans cette branche, réinitialiser previous
        previous = "None";
      }
      return false;
    }
  
    traverseChain(current);
  
    return { previous, next };

    
  }
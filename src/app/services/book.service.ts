import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private jsonUrl = '../../assets/data/books.json';
  private jsonData: any[] = [];
  
  constructor(private http: HttpClient) {
   const storedData = localStorage.getItem('jsonData');
    if (storedData) {
      this.jsonData = JSON.parse(storedData);
    }
  }

  //Metodo para obtener los datos del json y cargarlos al local Storage
  cargarData(){
    fetch(this.jsonUrl)
    .then((response) => response.json())
    .then((data:any) => {
      try {
        this.jsonData = data.library; // Almacena los datos en la lista
        localStorage.setItem('jsonData', JSON.stringify(this.jsonData));
      } catch (error) {
        console.error(`Error al guardar datos en el localStorage: ${error}`);
      }
    })
    .catch((error) => {
      console.error('Error al cargar el JSON:', error);
    });
  }

  //Metodo para lllamar otener los libros del json Data
  getJsonData(){
    this.cargarData();
  }

  //Metodo para obtener los libros y paginarlos
  getBooksPagina(paginaActual: number, elementosPorPagina: number): Observable<any[]> {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return of(this.jsonData.slice(inicio, fin)); // Utiliza los datos del arreglo jsonData
  }

  //Metodo para obtener los generos de los libros sin repetirse
  getGenre(): Observable<string[]> {
    const generos = new Set<string>();
    this.jsonData.forEach((libro: any) => {
      const genero = libro.book.genre;
      if (genero) {
        generos.add(genero);
      }
    });
    return of(Array.from(generos));
  }

  //Metodo para obtener libros a travez de un genero en específico 
  getBooksGenre(genero: string): Observable<any[]> {
    let libros = [...this.jsonData];
    if (genero) {
      libros = libros.filter((libro: any) => libro.book.genre === genero);
    }
    return of(libros);
  }

  //Metodo para obtener un libro por medio del isbn
  getBookById(id: number): Observable<any> {
    const libroEncontrado = this.jsonData.find((libro: any) => libro.book.ISBN === id);
    return of(libroEncontrado || null); // Retorna el libro encontrado o null si no se encuentra
  }

  //Obtenemos el elemento
  getFromLocalStorage(): any {
    const localStorageItem = localStorage.getItem('listaLectura');
    if (localStorageItem) {
      return JSON.parse(localStorageItem);
    }
    return null; 
  }
}

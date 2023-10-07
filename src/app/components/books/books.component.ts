import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BookService } from 'src/app/services/book.service';
import { ModalsComponent } from '../modals/modals.component';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit{
  books: any[] = [];
  paginaActual = 1;
  elementosPorPagina = 8;
  maxPagina = 2;
  ListBooks: any;
  generoSeleccionado="Todas"; 
  generos: string[] = []; 
  listaLectura: any[] = [];

  constructor(private _bookService: BookService,private dialog: MatDialog){

  }

  ngOnInit():void{
    //Obtenemos los cambios en tiempo real que se hagan en lal lista
    window.addEventListener('storage', (event) => {
      if (event.key === 'listaLectura') {
        // Actualiza la lista de deseos en esta pestaña
        const newValue = event.newValue;
        if (newValue !== null) {
          this.listaLectura = JSON.parse(newValue);
        }
      }
    });
    this._bookService.getJsonData();
    this.obtenerLibros();
    this.consultarGeneros();
    this.obtenerLibroslistaLectura();
  }

  obtenerLibroslistaLectura(){
    //Este codigo permite actualizar con los valores nuevos a la listaLectura 
    const storedData = localStorage.getItem('listaLectura');
    if (storedData) {
      this.listaLectura = JSON.parse(storedData);
    }
  }
  //Metodo para obtener libros por pagina
  obtenerLibros(){
    this._bookService.getBooksPagina(this.paginaActual, this.elementosPorPagina).subscribe(data =>{
      this.books = data;
    });
  }

  //Metodo para actualizar la lista de libros según el valor del range 
  cambiarPagina() {
    this.obtenerLibros(); // Actualiza la lista de libros al cambiar el valor del rango
  }

  //Metodo para obtener lirbos por genero seleccionado
  obtenerLibrosGenero() {
    this._bookService. getBooksGenre(this.generoSeleccionado).subscribe(libros => {
      this.books = libros.map(element => element);
      this.maxPagina = Math.ceil(libros.length / this.elementosPorPagina);
    });
  }

  //Metodo para obtener una lista sin duplicados de los generos
  consultarGeneros() {
    this._bookService.getGenre().subscribe(generos => {
      this.generos = generos;
    });
  }

  //Metodo para escuchar cambios en el select
  onGeneroChange() {
    if (this.generoSeleccionado != "Todas") {
      // Si se selecciona "Todas", llamar a consultarLibros sin filtro
      this.obtenerLibrosGenero();
    }else{
      this.obtenerLibros();
      this.paginaActual = 1;
      this.elementosPorPagina = 8;
    }
  }

  //Metodo para abrir el modal y verificar si se agrega o no el libro a Lista deseados
  agregar(isbn: any){
    const dialogRef = this.dialog.open(ModalsComponent, {
      width: "350px",
      data: {mensaje: 'Desea agregar este libro a libros deseados?'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'Aceptar'){
         // Llama al servicio para obtener el libro por su ID
        this.addListaLectura(isbn);
      }
    });
  }

  //Agregamos el libro a la lista de lectura y al localStorage, y lo eliminamos de la lista principal
  addListaLectura(isbn: any){
    this._bookService.getBookById(isbn).subscribe(element => {
      element.disabled = true;

      //Agregamos a la lista de lectura y al local Storage
      this.listaLectura.push(element);
      localStorage.setItem('listaLectura', JSON.stringify(this.listaLectura));
      this.obtenerLibroslistaLectura();
    });

  }

  //Eliminar el libro de la lista de lectura
  deleteBook(isbn: any){
    // Obtener la información del libro desde el localStorage
    const libro = localStorage.getItem('listaLectura');
    let nuevaListaLectura;

    if (libro) {
      // Parsear el libro si existe en el localStorage
      const libroParseado = JSON.parse(libro);
      libroParseado.forEach((element:any) => {
        //Metodo para capturar el libro según el que haya sido seleccionado para borrar
        if(element.book.ISBN === isbn){
          nuevaListaLectura = libroParseado.filter((libro: any) => {
            // Comprobar si el ISBN del libro coincide con el ISBN especificado
            return libro.book.ISBN !== isbn;
          });
          localStorage.setItem('listaLectura', JSON.stringify(nuevaListaLectura));
        } 

      });
    } 
    this.obtenerLibroslistaLectura();
  }

  //Metodo para validar el el libro fue guardado en lista Lectura
  isBookDisabled(ISBN: string): boolean {
    // Buscar el libro en la lista de deseos
    const libroEnListaDeseados = this.listaLectura.find(book => book.book.ISBN === ISBN);
    // Verificar si el libro está en la lista de deseos y si la propiedad 'disabled' es 'true'
    return libroEnListaDeseados && libroEnListaDeseados.disabled === true;
  }
}

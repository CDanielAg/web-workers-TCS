# CSV Worker

Página web que carga un archivo CSV, lo procesa en segundo plano con un Web
Worker y presenta el resultado en una tabla HTML.

## Requisitos

- Node.js 18 o posterior.

## Ejecución

~~~bash
npm start
~~~

Después, abre 'http://localhost:4173' y selecciona un archivo CSV. Puedes usar
'datos/empleados.csv' para probar el funcionamiento.

La página debe abrirse mediante el servidor local. Los navegadores restringen el
uso de Web Workers cuando un archivo HTML se abre directamente con 'file://'.

## Archivos principales

- 'index.html': estructura semántica de la interfaz.
- 'css/styles.css': diseño adaptable.
- 'js/app.js': interacción, carga del archivo y creación de la tabla.
- 'js/csv-worker.js': lectura y transformación del CSV en segundo plano.
- 'datos/empleados.csv': archivo de prueba.

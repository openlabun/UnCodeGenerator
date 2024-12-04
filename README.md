## UN Code Generator

It takes as input a PlantUML class diagram and outputs the JAVA classes that match it


/////

Integrantes del grupo: Andres Plata 200177477

Pasos para Ejecutar:

    1. descargar la extension ESLint

    2. Click derecho en el archivo 'index.html'

    3. Open With Live Server (Esto abrira una pestaña de google con la pagina)
    
    4. ingresar como input el diagrama en PlantUML

        Ejemplo:                        (Todo dentro de @startuml y @enduml )
                @startuml
                class Profesor {
                    +String nombre
                }

                class Curso {
                    +String titulo
                }

                Profesor --> "*" Curso
                @enduml

    5. Click en 'Generate Java Files'







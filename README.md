## UN Code Generator

It takes as input a PlantUML class diagram and outputs the JAVA classes that match it
Ejemplos Para el codigo

@startuml
abstract class Animal {
    + String nombre
    + void hacerSonido()
}

class Perro extends Animal {
    + void hacerSonido()
}
@enduml

@startuml
abstract class Animal {
    + String nombre
    + void hacerSonido()
}

class Perro {
    + void hacerSonido()
}

Perro --|> Animal
@enduml

@startuml
enum DiaSemana {
    LUNES, MARTES, MIERCOLES
}
@enduml

@startuml
class Profesor {
    + String nombre
}

class Curso {
    + String titulo
}

Profesor "1" -- "*" Curso
@enduml

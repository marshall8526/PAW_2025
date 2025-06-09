# Programowanie aplikacji webowych 2025

## Wymagania na zaliczenie

Zaliczenie odbywa się przez zgłoszenie mi tego poprzez wysłanie wiadomości prywatnej na Teams, na którą odpowiem proponując termin spotkania na Teams, kiedy zaprezentujecie mi rozszerzenie projektu o funkcjonalności wymienione poniżej. Pracujecie nad częścią obowiązkową, a potem już opcjonalnie nad dalszymi. Podczas prezentacji udostępniacie swój ekran i zgłaszacie mi ocenę, do której aspirujecie.

#### Część obowiązkowa (na 3)

##### Rozszerzyć model o zadania (Tasks)
Do każdego projektu przynależy zbiór zadań posiadających nazwę, datę rozpoczęcia i opcjonalną datę zakończenia (jej ustawienie oznacza że zadanie zostało zakończone) oraz osobę odpowiedzialną za zadanie (uwaga: musi to być osoba wymieniona wśród wykonawców projektu). Każde zadanie może należeć do wielu projektów, przy czym informacja o tej relacji znajduje się w kolekcji Projects. GUI do zarządzania zadaniami jest nową pozycją w nawigacji, gdzie widzimy tabelę z zadaniami oraz dodatkowo liczbą projektów do których to zadanie należy. Zakwalifikowanie zadania do projektu odbywa się w edytorze zadania i działa podobnie do wyboru wykonawców w projekcie. Wybór osoby odpowiedzialnej powinien operować wyłącznie na członkach projektu.

#### Na 4

##### Zadbać o spójność danych przez zabronienia (na poziomie backendu):
* usunięcia osoby, jeżeli jest kierownikiem projektu, wykonawcą projektu, odpowiedzialną za jakieś zadanie; we frontendzie ma pojawić się odpowiednia informacja, pozwalająca na zidentyfikowanie miejsc, w których należy dokonać zmian, aby osobę taką usunąć;
* usunięcia zadania, jeżeli jest przypisane do jakichś projektów z informacją j.w.;
* przed wykonaniem faktycznego usunięcia, powinniśmy dostać dialog z potwierdzeniem (Usunąć? Tak/Nie);

##### Każda modyfikacja przeprowadzona przez zalogowanego użytkownika powinna być rozgłoszona do pozostałych zalogowanych

Rezultatem tego wydarzenia powinno być wyświetlenie snackbara'a z informacją, co się stało.

#### Na 5

Do każdego zadania można dodać notatki, przechowywane w odrębnej kolekcji. Notatki mają datę utworzenia i jej autora oraz typ, będący liczbą całkowitą, gdzie 1 oznacza notatkę tekstową, 2 oznacza plik graficzny, 3 dźwiękowy. Zawartość notatki jest przechowywana w bazie danych, włączając w to grafikę (np. w postaci Data URI). Przeglądać i dodawać notatki można z poziomu przeglądarki zadań, nie można ich natomiast usuwać ani modyfikować. Grafikę/dźwięk można uploadować z pliku lokalnego albo ze schowka.

## Ściągnięcie/aktualizacja projektu

Jak stworzyć folder ``pwa2025`` z najnowszą wersją projektu
```
git clone https://gitlab.com/mariusz.jarocki/paw2025.git
```
Jak zaktualizować istniejący folder z plikami projektu do najnowszej wersji
```
cd paw2025
git reset --hard HEAD
git pull
```

## Instalacja zależności
```
npm install
cd frontend
npm install
```

## Uruchomienie serwera backendu
```
npm start
```
Serwer będzie dostępny pod http://localhost:8000

## Kompilacja produkcyjnej wersji frontendu
```
cd frontend
npm run build
```

## Uruchomienie deweloperskiego serwera frontendu
```
cd frontend
npm run dev
```
Serwer będzie dostępny pod http://localhost:5173 (lub następnymi portami)
# Programowanie aplikacji webowych 2025

## Ściągnięcie/aktualizacja projektu

Jak stworzyć folder ``pwa2025`` z najnowszą wersją projektu
```
git clone https://gitlab.com/mariusz.jarocki/paw2025.git
```
Jak zaktualizować istniejący folder z plikami projektu do najnowszej wersji
```
cd paw2025
git reset
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
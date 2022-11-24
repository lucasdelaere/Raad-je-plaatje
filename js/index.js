// functie om methode aan een builtin class (bv. Array) toe te kennen
Function.prototype.method = function(name, func) {

    // koppel functie aan methode van prototype met opgegeven naam indien
    // het prototype nog geen methode had met die naam
    if (!this.prototype.hasOwnProperty(name)) {
        Object.defineProperty(
            this.prototype,
            name,
            {
                value: func,
                enumerable: false
            }
        );
    }

    // geef object terug zodat method calls aaneengeschakeld kunnen worden
    return this;
};

//Arraymethode 'shuffle' volgens het Fisher-Yates algoritme.
//Deze bevat minder bias dan het typische algoritme:
// array.sort((a,b) => 0.5 - Math.random())
//zie: https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
// en https://bost.ocks.org/mike/shuffle/compare.html
Array.method("shuffle", function() {
    //overloop array in omgekeerde volgorde
    for (let i = this.length - 1; i > 0; i--) {
        // neem willekeurige index j, kleiner of gelijk aan index i
        const j = Math.floor(Math.random() * (i + 1));
        //verwissel elementen op index i en j van plaats
        const tempValue = this[i];
        this[i] = this[j]
        this[j] = tempValue;
    }
    //geef de geshuffelde array terug
    return this;
})

//maakt een nieuw object van de klasse 'Spel' aan; wordt aangeroepen door de 'Maak spel'-knop
function maakSpel (aantal) {
    //20 vakjes indien niets meegegeven wordt aan aantal
    aantal = aantal !== "" ? aantal : "20"
    const spel = new Spel(aantal)
}


//klasse waarmee je een nieuw 'raad je plaatje' object (spel) kan instantieren en spelen
class Spel {
    constructor(aantal) {
        this.aantal = parseInt(aantal) //aantal vakjes, gegeven door gebruiker (20 indien geen opgegeven)
        this.pogingen = 0; //aantal pogingen (2 vakjes omdraaien)
        this.aangeklikt = []; //houdt de vakjes die de gebruiker aangeklikt heeft bij
        this.bord = document.getElementById("bord") //spelbord
        this.counter = document.getElementById("counter").firstElementChild //counter van pogingen (p-tag)

        //spel starten indien voorwaarden van test voldaan zijn
        if (this.test()) {
            //warning verbergen
            document.getElementById("alertWarning").classList.replace("alert-show", "alert-hide")
            this.start()
        } else {
            //warning weergeven
            document.getElementById("alertWarning").classList.replace("alert-hide", "alert-show")
            //warning laten verdwijnen na 5s
            window.setTimeout(function() {document.getElementById("alertWarning").classList.replace("alert-show", "alert-hide")}, 3000)
        }
    }
    //methode die nagaat of het aantal opgegeven vakjes even is
    test() {
        return (this.aantal % 2 === 0)
    }

    //methode die het spel start
    start() {
        //maak spelbord (border) zichtbaar
        this.bord.classList.replace("d-none", "d-block")
        //vorig spel resetten
        this.aangeklikt = []
        //alle vakjes verwijderen
        while (this.bord.firstChild) {
            this.bord.removeChild(this.bord.firstChild)
        }
        //aantal pogingen op 0 zetten
        this.pogingen = 0;
        this.counter.innerHTML = `Pogingen: ${this.pogingen}`

        //maak array met 2 keer de getallen 0 - (aantal/2 - 1) aan en shuffle die
        let getallen = Array.from(Array(this.aantal / 2).keys())
        getallen = [...getallen, ...getallen].shuffle();

        //voor elk getal een vakje toevoegen aan het bord
        getallen.forEach(getal => {
            let vakje = document.createElement("div")
            //tekst aan de voorkant van het vakje
            let tekst = document.createElement("p")
            vakje.classList.add("vakje", "achterkant", "d-flex", "justify-content-center")
            //'.bind(this)' bindt de methode this.klik aan this, dus aan deze instantie van de klasse Spel. Anders herkent onclick de methode klik niet
            vakje.onclick = this.klik.bind(this)
            tekst.innerHTML = `${getal}`
            tekst.classList.add("d-none", "text-white", "fs-1", "my-auto")
            //getal als tekst toevoegen in vakje
            vakje.appendChild(tekst)
            this.bord.appendChild(vakje)
        })
    }


    //wordt aangeroepen als vakje wordt aangeklikt
    klik(event) {
        //bepaal het vakje dat werd aangeklikt
        const vakje = event.target
        //niets doen als vakje al is omgedraaid
        if (!vakje.classList.contains("achterkant")) {
            return undefined;
        } else {
            //toont een vakje indien het nog niet omgedraaid is
            this.toon(vakje)
        }
        //Toon een modal en start automatisch een nieuw spel (met zelfde aantal vakjes) als alle tegels omgedraaid zijn
        if (this.bord.getElementsByClassName("achterkant").length === 0) {
            window.setTimeout(() => {
                document.getElementById("exampleModalLabel").innerHTML = `Goed gedaan! Je loste het spel op in ${this.pogingen} pogingen. Sluit dit kader om opnieuw te beginnen.`
               let myModal = new bootstrap.Modal(document.getElementById("exampleModal"), {})
                myModal.show()
                this.start()
                }, 500)

        }
    }

    //draait een vakje om
    toon(vakje) {
     //Nagaan of er nog 2 (verschillende) vakjes getoond worden door een //vorige setTimeout bij het aanklikken van een 3e vakje. Anders //zouden 3 of meer vakjes tegelijk kunnen getoond worden.
        if (this.aangeklikt.length === 2) {
            //timeout op eerste 2 vakjes verwijderen (anders wordt 3e vakje mee verborgen op einde van de vorige timeout)
            window.clearTimeout(this.timeout)
            //eerste 2 vakjes verbergen
            this.verberg()
        }

        //opmaak van vakje aanpassen bij omdraaien
        vakje.classList.remove("achterkant");
        vakje.classList.add("bg-primary", "align-items-center")
        //tekst zichtbaar maken
        vakje.firstChild.classList.replace("d-none","d-block")

        //vakje toevoegen aan de aangeklikte vakjes
        this.aangeklikt.push(vakje)

        //wanneer twee tegels aangeklikt zijn
        if (this.aangeklikt.length === 2) {
            this.pogingen += 1;
            this.counter.innerHTML = `Pogingen: ${this.pogingen}`
            const getal1 = this.aangeklikt[0].firstChild.innerHTML;
            const getal2 = this.aangeklikt[1].firstChild.innerHTML;
            if (getal1 === getal2) {
                //tegels omgedraaid laten en array van aangeklikte leegmaken
                this.aangeklikt = []
            } else {
                //tegels terug verbergen en timeout toevoegen zodat gebruiker tijd (1s) heeft om 2e omgedraaide tegel te zien
                this.timeout = window.setTimeout(this.verberg.bind(this), 1000)
            }
        }
    }
    //verbergt de aangeklikte vakjes (omgekeerde van een vakje tonen)
    verberg() {
        for (let i in this.aangeklikt) {
            this.aangeklikt[i].classList.add("achterkant")
            this.aangeklikt[i].firstChild.classList.replace("d-block", "d-none")
        }
        this.aangeklikt = []
    }
}




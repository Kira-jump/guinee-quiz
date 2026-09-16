import { useState, useEffect, useRef } from 'react'
import './App.css'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot, updateDoc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import AuthForm from './AuthForm'
import CompleteProfile from './CompleteProfile'

const allQuestions = [
  { q: "Quelle est la capitale de la Guinée ?", opts: ["Kankan", "Conakry", "Labé", "Nzérékoré"], a: 1 },
  { q: "Quel fleuve célèbre prend sa source en Guinée ?", opts: ["Le Congo", "Le Niger", "Le Nil", "Le Sénégal"], a: 1 },
  { q: "Comment surnomme-t-on la Guinée à cause de ses nombreux fleuves ?", opts: ["Le Sahara vert", "Le château d'eau de l'Afrique de l'Ouest", "La perle noire", "Le grenier de l'Afrique"], a: 1 },
  { q: "Quelle chaîne de montagnes se trouve en Moyenne-Guinée ?", opts: ["L'Atlas", "Le Fouta Djallon", "Le Drakensberg", "Le Rwenzori"], a: 1 },
  { q: "Quel est le point culminant de la Guinée ?", opts: ["Le Mont Nimba", "Le Kilimandjaro", "Le Mont Cameroun", "Le Pic de Fon"], a: 0 },
  { q: "Combien de régions naturelles compte la Guinée ?", opts: ["3", "4", "5", "6"], a: 1 },
  { q: "Quelle région guinéenne est couverte de forêts tropicales denses ?", opts: ["Basse-Guinée", "Moyenne-Guinée", "Guinée forestière", "Haute-Guinée"], a: 2 },
  { q: "Quel océan borde la Guinée ?", opts: ["Océan Indien", "Océan Atlantique", "Mer Méditerranée", "Océan Pacifique"], a: 1 },
  { q: "Quel archipel touristique se trouve près de Conakry ?", opts: ["Les Canaries", "Les Îles de Los", "Les Comores", "Les Seychelles"], a: 1 },
  { q: "Avec combien de pays la Guinée partage-t-elle une frontière ?", opts: ["4", "5", "6", "7"], a: 2 },
  { q: "Lequel de ces pays NE partage PAS de frontière avec la Guinée ?", opts: ["Mali", "Liberia", "Ghana", "Sénégal"], a: 2 },
  { q: "Quelle ville guinéenne est surnommée la Suisse guinéenne pour son climat frais ?", opts: ["Dalaba", "Kissidougou", "Siguiri", "Forécariah"], a: 0 },
  { q: "Quelle ville est réputée pour ses gisements de bauxite ?", opts: ["Kissidougou", "Boké", "Faranah", "Dalaba"], a: 1 },
  { q: "Quelle ville est le chef-lieu de la Haute-Guinée ?", opts: ["Kankan", "Labé", "Kindia", "Boké"], a: 0 },
  { q: "Quelle ville est le chef-lieu de la Moyenne-Guinée ?", opts: ["Mamou", "Labé", "Kindia", "Pita"], a: 1 },
  { q: "Quel type de climat domine en Guinée ?", opts: ["Désertique", "Tropical", "Polaire", "Méditerranéen"], a: 1 },
  { q: "Quel fleuve traverse la ville de Kankan ?", opts: ["Le Milo", "Le Sénégal", "Le Congo", "La Gambie"], a: 0 },
  { q: "Quelle ville se trouve au sud de Conakry, sur la côte ?", opts: ["Forécariah", "Kindia", "Mamou", "Kouroussa"], a: 0 },
  { q: "Quelle est la plus grande ville de Guinée ?", opts: ["Conakry", "Kankan", "Nzérékoré", "Labé"], a: 0 },
  { q: "Quel type d'écosystème domine en Guinée forestière ?", opts: ["Désert", "Forêt tropicale dense", "Toundra", "Savane sèche"], a: 1 },
  { q: "En quelle année la Guinée a-t-elle obtenu son indépendance ?", opts: ["1958", "1960", "1962", "1956"], a: 0 },
  { q: "Qui était le premier président de la Guinée indépendante ?", opts: ["Lansana Conté", "Sékou Touré", "Alpha Condé", "Dadis Camara"], a: 1 },
  { q: "De quelle puissance coloniale la Guinée était-elle une colonie ?", opts: ["France", "Royaume-Uni", "Portugal", "Belgique"], a: 0 },
  { q: "En 1958, la Guinée a voté non à un référendum proposé par qui ?", opts: ["Charles de Gaulle", "Napoléon", "Georges Pompidou", "François Mitterrand"], a: 0 },
  { q: "Qui a succédé à Sékou Touré après sa mort en 1984 ?", opts: ["Lansana Conté", "Alpha Condé", "Moussa Dadis Camara", "Mamadi Doumbouya"], a: 0 },
  { q: "En quelle année Lansana Conté est-il arrivé au pouvoir ?", opts: ["1980", "1984", "1990", "1975"], a: 1 },
  { q: "Qui est devenu président après la mort de Lansana Conté en 2008 ?", opts: ["Alpha Condé", "Moussa Dadis Camara", "Sékou Touré", "Cellou Dalein Diallo"], a: 1 },
  { q: "En quelle année Alpha Condé a-t-il été élu, lors d'une élection démocratique majeure ?", opts: ["2008", "2010", "2012", "2015"], a: 1 },
  { q: "En quelle année un coup d'État militaire a-t-il renversé Alpha Condé ?", opts: ["2019", "2020", "2021", "2022"], a: 2 },
  { q: "Qui a dirigé le coup d'État de 2021 en Guinée ?", opts: ["Mamadi Doumbouya", "Dadis Camara", "Sékou Touré", "Alpha Condé"], a: 0 },
  { q: "Quel empire médiéval couvrait une partie du territoire guinéen actuel ?", opts: ["Empire romain", "Empire du Mali", "Empire ottoman", "Empire mongol"], a: 1 },
  { q: "Quel royaume peul s'est établi au Fouta Djallon au 18e siècle ?", opts: ["Royaume zoulou", "Imamat du Fouta Djallon", "Royaume ashanti", "Empire songhaï"], a: 1 },
  { q: "Quel résistant guinéen a combattu la colonisation française à la fin du 19e siècle ?", opts: ["Samory Touré", "Sékou Touré", "Askia Mohammed", "Chaka Zoulou"], a: 0 },
  { q: "Samory Touré est le fondateur de quel empire ?", opts: ["L'empire Wassoulou", "L'empire du Ghana", "L'empire songhaï", "L'empire mandingue"], a: 0 },
  { q: "En quelle année la Guinée française a-t-elle été créée comme colonie distincte ?", opts: ["1885", "1891", "1900", "1904"], a: 1 },
  { q: "La Guinée faisait partie de quelle fédération coloniale française ?", opts: ["Afrique-Occidentale française", "Afrique-Équatoriale française", "Union sud-africaine", "Fédération du Maghreb"], a: 0 },
  { q: "Sékou Touré était l'arrière-petit-fils de quel résistant historique ?", opts: ["Samory Touré", "Chaka Zoulou", "Askia Mohammed", "El Hadj Omar Tall"], a: 0 },
  { q: "Quel est le nom du parti unique fondé par Sékou Touré ?", opts: ["PDG", "RPG", "UFDG", "UFR"], a: 0 },
  { q: "En quelle année la Guinée a-t-elle organisé sa première élection présidentielle multipartite ?", opts: ["2000", "2005", "2010", "2015"], a: 2 },
  { q: "Quel événement tragique a eu lieu au stade de Conakry en septembre 2009 ?", opts: ["Un massacre de manifestants", "Un tremblement de terre", "Un incendie", "Une inondation"], a: 0 },
  { q: "Quel est le régime politique de la Guinée ?", opts: ["Monarchie", "République", "Théocratie", "Fédération"], a: 1 },
  { q: "Quelle couleur du drapeau guinéen est la plus proche de la hampe ?", opts: ["Rouge", "Jaune", "Vert", "Bleu"], a: 0 },
  { q: "Que symbolise le rouge du drapeau guinéen ?", opts: ["Le sang versé pour l'indépendance", "La végétation", "Le soleil", "La mer"], a: 0 },
  { q: "Que symbolise le jaune du drapeau guinéen ?", opts: ["La paix", "Le soleil et les richesses minières", "L'eau", "Le sable"], a: 1 },
  { q: "Que symbolise le vert du drapeau guinéen ?", opts: ["L'eau", "Le ciel", "La végétation et la solidarité", "Le désert"], a: 2 },
  { q: "Quel est le nom de l'hymne national guinéen ?", opts: ["Liberté", "La Marseillaise", "Guinée éternelle", "Debout Guinéens"], a: 0 },
  { q: "Quelle est la devise de la République de Guinée ?", opts: ["Liberté Égalité Fraternité", "Travail Justice Solidarité", "Unité Travail Progrès", "Paix Travail Patrie"], a: 1 },
  { q: "Combien de bandes verticales compte le drapeau guinéen ?", opts: ["2", "3", "4", "5"], a: 1 },
  { q: "Quel animal figure sur les armoiries de la Guinée ?", opts: ["Un lion", "Un éléphant", "Un aigle", "Un cheval"], a: 1 },
  { q: "Quelle est la monnaie officielle de la Guinée ?", opts: ["Le franc CFA", "Le franc guinéen", "Le cedi", "Le dollar"], a: 1 },
  { q: "Dans quelle ville se trouve le siège du gouvernement guinéen ?", opts: ["Kankan", "Conakry", "Labé", "Mamou"], a: 1 },
  { q: "Comment appelle-t-on l'assemblée qui vote les lois en Guinée ?", opts: ["Sénat", "Assemblée nationale", "Parlement européen", "Conseil constitutionnel"], a: 1 },
  { q: "La Guinée est membre de quelle organisation régionale ouest-africaine ?", opts: ["CEDEAO", "SADC", "UMA", "EAC"], a: 0 },
  { q: "Quelle langue nationale est parlée majoritairement en Haute-Guinée ?", opts: ["Malinké", "Wolof", "Zoulou", "Amharique"], a: 0 },
  { q: "Quelle langue est parlée par le peuple Soussou en Basse-Guinée ?", opts: ["Soussou", "Peul", "Kissi", "Toma"], a: 0 },
  { q: "Quelle langue est parlée majoritairement au Fouta Djallon ?", opts: ["Pular (Peul)", "Malinké", "Soussou", "Kpèlè"], a: 0 },
  { q: "Quelle langue est parlée par le peuple Kissi en Guinée forestière ?", opts: ["Kissi", "Peul", "Malinké", "Soussou"], a: 0 },
  { q: "Quelle langue reste celle de l'administration et de l'enseignement en Guinée ?", opts: ["Le français", "L'anglais", "L'espagnol", "Le portugais"], a: 0 },
  { q: "Quel titre porte le chef de l'État guinéen depuis la transition de 2021 ?", opts: ["Roi", "Président de la transition", "Premier ministre", "Empereur"], a: 1 },
  { q: "Quelle date marque la fête de l'indépendance guinéenne ?", opts: ["Le 2 octobre", "Le 14 juillet", "Le 25 mai", "Le 1er janvier"], a: 0 },
  { q: "Quelle est la religion majoritaire en Guinée ?", opts: ["Christianisme", "Islam", "Hindouisme", "Bouddhisme"], a: 1 },
  { q: "Quel pourcentage approximatif de Guinéens est musulman ?", opts: ["Moins de 20%", "Environ 50%", "Plus de 85%", "100%"], a: 2 },
  { q: "Quel est le plus grand groupe ethnique de Guinée ?", opts: ["Peul", "Soussou", "Malinké", "Kissi"], a: 0 },
  { q: "Quel groupe ethnique est historiquement lié à la Haute-Guinée ?", opts: ["Malinké", "Peul", "Soussou", "Baga"], a: 0 },
  { q: "Quel groupe ethnique vit majoritairement sur la côte autour de Conakry ?", opts: ["Soussou", "Peul", "Malinké", "Guerzé"], a: 0 },
  { q: "Quels groupes vivent principalement en Guinée forestière ?", opts: ["Kissi, Toma et Guerzé", "Peul et Malinké", "Zoulou et Xhosa", "Wolof et Sérère"], a: 0 },
  { q: "Quel plat à base de riz et sauce arachide est emblématique de la Guinée ?", opts: ["Riz sauce graine", "Couscous", "Injera", "Fufu"], a: 0 },
  { q: "Quelle boisson traditionnelle guinéenne est à base de gingembre ?", opts: ["Jus de gingembre", "Thé vert", "Vin de palme uniquement", "Bissap uniquement"], a: 0 },
  { q: "Quel vêtement traditionnel brodé est très porté en Guinée ?", opts: ["Le kimono", "Le boubou brodé", "Le sari", "Le kilt"], a: 1 },
  { q: "Quel instrument mandingue en forme de harpe-luth est emblématique de la culture guinéenne ?", opts: ["La kora", "Le djembé", "Le balafon", "Le violon"], a: 0 },
  { q: "Quel instrument à percussion sur pied est très populaire en Guinée ?", opts: ["Le djembé", "Les congas", "Le cajón", "Le tam-tam indien"], a: 0 },
  { q: "Quelle troupe nationale guinéenne de danse et musique est mondialement connue ?", opts: ["Les Ballets Africains", "Le Bolshoï", "L'Opéra de Paris", "Le Cirque du Soleil"], a: 0 },
  { q: "Quel chanteur guinéen est célèbre pour le titre Yé Ké Yé Ké ?", opts: ["Mory Kanté", "Youssou N'Dour", "Salif Keita", "Fela Kuti"], a: 0 },
  { q: "Quel griot guinéen est surnommé la voix d'or du pays ?", opts: ["Sékouba Bambino", "Mory Kanté", "Kandia Kouyaté", "Ba Cissoko"], a: 0 },
  { q: "Quelle chanteuse griotte guinéenne est connue sous le nom de Kandia ?", opts: ["Kandia Kouyaté", "Miriam Makeba", "Angélique Kidjo", "Oumou Sangaré"], a: 0 },
  { q: "Quel type de conteur-musicien, gardien de la mémoire orale, est central en Guinée ?", opts: ["Le griot", "Le chaman", "Le barde celte", "Le moine"], a: 0 },
  { q: "Quel masque rituel sculpté en bois est emblématique de la culture forestière guinéenne ?", opts: ["Le masque Nimba", "Le masque vénitien", "Le masque grec", "Le masque japonais"], a: 0 },
  { q: "Quelle fête musulmane est célébrée à la fin du Ramadan en Guinée ?", opts: ["L'Aïd el-Fitr", "Noël", "Hanouka", "Diwali"], a: 0 },
  { q: "Quelle grande fête est célébrée environ 70 jours après l'Aïd el-Fitr ?", opts: ["L'Aïd el-Kébir (Tabaski)", "La Pentecôte", "Le Nouvel An chinois", "Le Vesak"], a: 0 },
  { q: "Quel pourcentage approximatif de la population guinéenne est chrétien ?", opts: ["Environ 1%", "Environ 8 à 10%", "Environ 40%", "Environ 60%"], a: 1 },
  { q: "Quelle grande mosquée se trouve à Conakry ?", opts: ["La Grande Mosquée Fayçal", "La Mosquée bleue", "La Mosquée de Djenné", "La Mosquée Hassan II"], a: 0 },
  { q: "Quel plat à base de feuilles pilées est très populaire en Guinée ?", opts: ["La sauce feuilles", "La ratatouille", "Le tajine", "La paella"], a: 0 },
  { q: "Quelle boisson fermentée est tirée du palmier en Guinée ?", opts: ["Le vin de palme", "La bière blonde", "Le cidre", "Le saké"], a: 0 },
  { q: "Quel plat de riz épicé est souvent partagé lors des fêtes en Guinée ?", opts: ["Le riz gras", "Le risotto", "La paella", "Le pilaf indien"], a: 0 },
  { q: "Quelle ressource minière fait de la Guinée un grand exportateur mondial ?", opts: ["L'or", "La bauxite", "Le pétrole", "Le charbon"], a: 1 },
  { q: "La Guinée détiendrait quelle part des réserves mondiales de bauxite ?", opts: ["Moins de 1%", "Environ 10%", "Plus d'un quart", "La totalité"], a: 2 },
  { q: "Quel métal est extrait de la bauxite après transformation ?", opts: ["Le fer", "L'aluminium", "Le cuivre", "Le zinc"], a: 1 },
  { q: "Quel gisement de fer guinéen est l'un des plus riches au monde ?", opts: ["Simandou", "Kaloum", "Boffa", "Siguiri"], a: 0 },
  { q: "Quelle ville est associée à l'extraction historique de l'or en Guinée ?", opts: ["Siguiri", "Labé", "Mamou", "Dalaba"], a: 0 },
  { q: "Quel secteur emploie la majorité de la population active en Guinée ?", opts: ["L'industrie", "L'agriculture", "Le tourisme", "La finance"], a: 1 },
  { q: "Quelle culture d'exportation est cultivée en Guinée forestière ?", opts: ["Le blé", "Le café", "L'avoine", "Le seigle"], a: 1 },
  { q: "Quel fruit tropical est cultivé pour l'exportation en Basse-Guinée ?", opts: ["La pomme", "L'ananas", "La poire", "La cerise"], a: 1 },
  { q: "Quelle est la principale culture vivrière consommée en Guinée ?", opts: ["Le blé", "Le riz", "Le maïs", "L'orge"], a: 1 },
  { q: "Quel port assure l'essentiel des exportations minières guinéennes ?", opts: ["Le port de Conakry", "Le port de Dakar", "Le port d'Abidjan", "Le port de Lagos"], a: 0 },
  { q: "Quelle entreprise historique exploite la bauxite guinéenne à Boké ?", opts: ["CBG", "Total", "Shell", "De Beers"], a: 0 },
  { q: "Quelle devise est aussi utilisée pour le commerce international en Guinée ?", opts: ["Le dollar américain", "Le yen", "Le rouble", "Le franc suisse"], a: 0 },
  { q: "Quel projet ferroviaire vise à transporter le fer de Simandou vers la côte ?", opts: ["Le chemin de fer Simandou", "Le TGV guinéen", "Le métro de Conakry", "Le tramway de Kankan"], a: 0 },
  { q: "Quelle part du PIB guinéen provient environ du secteur minier ?", opts: ["Moins de 1%", "Environ 20 à 25%", "Plus de 90%", "50 à 60%"], a: 1 },
  { q: "Quel barrage hydroélectrique important approvisionne Conakry en électricité ?", opts: ["Le barrage de Kaléta", "Le barrage d'Assouan", "Le barrage des Trois Gorges", "Le barrage Hoover"], a: 0 },
  { q: "Quel secteur touristique la Guinée cherche-t-elle à développer avec le Fouta Djallon ?", opts: ["L'écotourisme", "Le tourisme spatial", "Le tourisme polaire", "Le tourisme urbain uniquement"], a: 0 },
  { q: "Quel est le nom de l'aéroport international de Conakry ?", opts: ["Conakry-Gbessia", "JFK", "Charles de Gaulle", "Heathrow"], a: 0 },
  { q: "Quelle pierre précieuse est aussi extraite dans certaines régions de Guinée forestière ?", opts: ["Le diamant", "Le rubis", "L'émeraude", "Le saphir"], a: 0 },
  { q: "Quel est l'indicatif téléphonique international de la Guinée ?", opts: ["+221", "+224", "+225", "+233"], a: 1 },
  { q: "Quel est le domaine internet national de la Guinée ?", opts: [".gn", ".gh", ".ga", ".gm"], a: 0 },
  { q: "Quel fuseau horaire utilise la Guinée ?", opts: ["UTC+0 (GMT)", "UTC+2", "UTC-5", "UTC+8"], a: 0 },
  { q: "Quel pourcentage approximatif de la population guinéenne vit en zone rurale ?", opts: ["Moins de 10%", "Environ 30%", "Plus de 60%", "100%"], a: 2 },
  { q: "Quel alphabet a été créé pour transcrire les langues mandingues comme le malinké ?", opts: ["Le N'Ko", "L'alphabet cyrillique", "Les hiéroglyphes", "Le braille"], a: 0 },
  { q: "Qui a inventé l'alphabet N'Ko dans les années 1940 ?", opts: ["Solomana Kanté", "Sékou Touré", "Samory Touré", "Alpha Condé"], a: 0 },
  { q: "Quelle est la plus grande université de Guinée, située à Conakry ?", opts: ["Université Gamal Abdel Nasser", "Harvard", "Université Cheikh Anta Diop", "La Sorbonne"], a: 0 },
  { q: "Quel écrivain guinéen a écrit le roman L'Enfant noir ?", opts: ["Camara Laye", "Ahmadou Kourouma", "Léopold Sédar Senghor", "Chinua Achebe"], a: 0 },
  { q: "Comment se nomme l'équipe nationale de football masculine de la Guinée ?", opts: ["Le Syli National", "Les Lions Indomptables", "Les Éléphants", "Les Aigles"], a: 0 },
  { q: "Que signifie Syli en langue soussou ?", opts: ["Éléphant", "Lion", "Tigre", "Aigle"], a: 0 },
  { q: "En quelle couleur joue traditionnellement le Syli National à domicile ?", opts: ["Rouge", "Bleu", "Vert", "Jaune"], a: 0 },
  { q: "La Guinée a-t-elle déjà remporté la Coupe d'Afrique des Nations ?", opts: ["Oui en 1976", "Non, jamais", "Oui en 1990", "Oui en 2015"], a: 1 },
  { q: "En quelle année la Guinée a-t-elle été finaliste de la CAN, sa meilleure performance ?", opts: ["1970", "1976", "1982", "1994"], a: 1 },
  { q: "Où la lutte traditionnelle est-elle particulièrement pratiquée en Guinée ?", opts: ["En Haute-Guinée lors des récoltes", "Uniquement à Conakry", "Sur les plages", "Nulle part"], a: 0 },
  { q: "Quel est le stade principal de Conakry pour les matchs internationaux ?", opts: ["Stade du 28 Septembre", "Stade de France", "Wembley", "Camp Nou"], a: 0 },
  { q: "Le nom du stade principal de Conakry commémore quel événement ?", opts: ["Le référendum de 1958", "Une finale de CAN", "Un traité de paix", "Une victoire militaire"], a: 0 },
  { q: "Quelle fédération régit le football national guinéen ?", opts: ["La FÉGUIFOOT", "La FIFA seule", "L'UEFA", "La CAF seule"], a: 0 },
  { q: "Quel est le principal rival régional footballistique de la Guinée ?", opts: ["Le Sénégal", "La Norvège", "Le Japon", "Le Brésil"], a: 0 },
  { q: "Quel type de terrain caractérise souvent les stades en zone rurale guinéenne ?", opts: ["Terrain en terre battue", "Patinoire", "Piste de ski", "Court en gazon synthétique high-tech"], a: 0 },
  { q: "Quelle compétition régionale de football pour l'Afrique de l'Ouest la Guinée dispute-t-elle ?", opts: ["La Coupe UFOA", "La Copa America", "L'Euro", "La Coupe Davis"], a: 0 },
  { q: "Depuis quelle décennie environ la Guinée participe-t-elle aux compétitions sportives internationales ?", opts: ["Les années 1960", "Les années 2000", "Les années 1930", "Les années 1990"], a: 0 },
  { q: "Quel sport se pratique traditionnellement sur les plages de Conakry ?", opts: ["Le football de plage", "Le ski nautique extrême", "Le hockey sur glace", "La luge"], a: 0 },
  { q: "Quel sport collectif reste peu développé en Guinée comparé au football ?", opts: ["Le rugby", "Le football", "Le basketball", "L'athlétisme"], a: 0 },
  { q: "Quel écrivain guinéen a aussi écrit Le Regard du roi ?", opts: ["Camara Laye", "Mongo Beti", "Aimé Césaire", "Wole Soyinka"], a: 0 },
  { q: "Quelle spécialité à base de banane plantain frite est populaire en Guinée ?", opts: ["L'alloco", "La pizza", "Le sushi", "Les tacos"], a: 0 },
  { q: "Quelle noix, cultivée en Guinée, sert à fabriquer de l'huile de cuisine ?", opts: ["La noix de palme", "La noix de coco", "La cacahuète uniquement", "La noisette"], a: 0 },
  { q: "Comment appelle-t-on les habitants de la Guinée ?", opts: ["Les Guinéens", "Les Guinois", "Les Guinnéiens", "Les Guineans"], a: 0 },
  { q: "Quel quartier abrite le grand marché populaire de Conakry ?", opts: ["Madina", "Kaloum", "Ratoma", "Matam"], a: 0 },
  { q: "Quel quartier de Conakry abrite le siège de plusieurs ministères ?", opts: ["Kaloum", "Matoto", "Dixinn", "Ratoto"], a: 0 },
  { q: "Quel type de transport en commun est le plus utilisé à Conakry ?", opts: ["Le métro", "Le taxi collectif", "Le tramway", "Le téléphérique"], a: 1 },
  { q: "Quelle fête célèbre le travail chaque année en Guinée ?", opts: ["Le 1er mai", "Le 14 juillet", "Le 25 décembre", "Le 1er janvier"], a: 0 },
  { q: "Quel grand arbre sert souvent de lieu de rassemblement dans les villages ?", opts: ["Le fromager ou le baobab", "Le sapin", "Le chêne", "Le bouleau"], a: 0 },
  { q: "Quel type d'habitat traditionnel se rencontre dans les villages du Fouta Djallon ?", opts: ["Des cases rondes en pierre", "Des gratte-ciel", "Des igloos", "Des tipis"], a: 0 },
  { q: "Quelle rivière sépare en partie la Guinée de la Sierra Leone ?", opts: ["Le Moa", "Le Rhin", "Le Danube", "L'Amazone"], a: 0 },
  { q: "Quel tissu artisanal, tissé à la main, est porté lors des cérémonies en Guinée ?", opts: ["Le pagne tissé", "Le kimono", "Le sari", "Le poncho"], a: 0 },
  { q: "Quelle est la principale source d'énergie domestique en zone rurale guinéenne ?", opts: ["Le bois de chauffe", "Le nucléaire", "L'éolien", "Le solaire uniquement"], a: 0 },
  { q: "Quel est le grand marché emblématique de Conakry ?", opts: ["Le grand marché de Madina", "Le marché de Rungis", "Le souk de Marrakech", "Le marché de Covent Garden"], a: 0 },
  { q: "Quelle institution émet la monnaie guinéenne ?", opts: ["La Banque Centrale de la République de Guinée", "La BCEAO", "La Banque mondiale", "Le FMI"], a: 0 },
  { q: "Quel type de gouvernement dirige la Guinée pendant une période de transition ?", opts: ["Une monarchie héréditaire", "Un gouvernement de transition", "Une théocratie", "Un protectorat étranger"], a: 1 },
  { q: "Quelle spécialité à base de poisson fumé est très appréciée en Guinée ?", opts: ["Le poisson fumé braisé", "Le sushi", "Le fish and chips", "Le ceviche"], a: 0 },
  { q: "Quel type de sol riche en fer donne sa couleur rougeâtre à de nombreuses routes guinéennes ?", opts: ["La latérite", "Le sable blanc", "L'argile grise", "La craie"], a: 0 },
  { q: "Quel vent sec caractérise une partie de l'année en Guinée ?", opts: ["L'harmattan", "La mousson polaire", "L'hiver nordique", "Le blizzard"], a: 0 },
  { q: "Quel autre grand fleuve, en plus du Niger, prend sa source en Guinée ?", opts: ["Le Sénégal", "L'Amazone", "Le Nil", "Le Congo"], a: 0 },
  { q: "Quelle graine est utilisée pour préparer la sauce arachide guinéenne ?", opts: ["L'arachide", "Le tournesol", "Le sésame", "Le soja"], a: 0 },
  { q: "Quel organisme sportif régional ouest-africain organise des tournois disputés par la Guinée ?", opts: ["L'UFOA", "La CONCACAF", "L'AFC", "L'OFC"], a: 0 },
  { q: "Quelles croyances anciennes sont encore pratiquées dans certains villages de Guinée forestière ?", opts: ["Les religions traditionnelles africaines", "Le shintoïsme", "Le taoïsme", "Le jaïnisme"], a: 0 },
  { q: "Quel type de riz est cultivé dans les plaines inondées de Basse-Guinée ?", opts: ["Le riz de mangrove", "Le riz basmati importé", "Le riz sauvage canadien", "Le riz noir asiatique"], a: 0 },
  { q: "Depuis 2023, quel rang mondial occupe la Guinée en production de bauxite ?", opts: ["1er", "3e", "5e", "10e"], a: 0 },
  { q: "En quelle année a débuté la grande épidémie d'Ebola en Guinée ?", opts: ["2010", "2014", "2018", "2020"], a: 1 },
  { q: "Qu'est-ce que le fonio, cultivé en Guinée ?", opts: ["Une céréale traditionnelle", "Un tissu", "Un instrument de musique", "Une danse"], a: 0 },
  { q: "Quel arbre, présent en Guinée, produit le beurre de karité ?", opts: ["Le karité", "Le baobab", "Le manguier", "Le palmier"], a: 0 },
  { q: "La Guinée appartient à quelle union régionale avec le Liberia, la Sierra Leone et la Côte d'Ivoire ?", opts: ["L'Union du fleuve Mano", "La SADC", "L'UMA", "La CEDEAO"], a: 0 },
  { q: "Quelle embarcation traditionnelle utilisent les pêcheurs sur la côte guinéenne ?", opts: ["La pirogue", "Le kayak", "Le voilier", "Le sous-marin"], a: 0 },
  { q: "Quel site guinéen est classé réserve de biosphère et patrimoine mondial de l'UNESCO ?", opts: ["Le Mont Nimba", "La Tour Eiffel", "Le Sahara", "Le Kilimandjaro"], a: 0 },
  { q: "Quel autre grand fleuve, en plus du Niger et du Sénégal, prend sa source en Guinée ?", opts: ["La Gambie", "L'Amazone", "Le Nil", "Le Congo"], a: 0 },
  { q: "Près de quelle ville du Fouta Djallon se trouvent les chutes de Kinkon ?", opts: ["Pita", "Kankan", "Kindia", "Boké"], a: 0 },
  { q: "Comment appelle-t-on le chef traditionnel qui administre un village en Guinée ?", opts: ["Le chef de village", "Le maire", "Le gouverneur", "Le préfet"], a: 0 },
]

const roastMessages = [
  "T'es sûr que t'es pas un intrus \ud83e\udd28",
  "T'es sérieux là ? \ud83d\ude0f",
  "T'as un extrait de naissance biométrique au moins ? \ud83e\udd75",
  "T'as une carte d'identité au moins ? \ud83d\ude13",
  "Faut refaire l'école avec nous \ud83d\udcda\ud83d\ude29",
  "Bon... on va dire que c'était une faute de frappe \ud83d\ude05",
  "Aïe, même ta grand-mère aurait su ça \ud83d\udc75\ud83d\ude2d",
  "Le Syli National pleure en te regardant \u26bd\ud83d\ude22",
]

const LEVELS = [
  { name: "Niveau 1", count: 9 },
  { name: "Niveau 2", count: 11 },
  { name: "Niveau 3", count: 12 },
  { name: "Niveau 4", count: 14 },
  { name: "Niveau 5", count: 15 },
  { name: "Niveau 6", count: 17 },
  { name: "Niveau 7", count: 18 },
  { name: "Niveau 8", count: 20 },
  { name: "Niveau 9", count: 21 },
  { name: "Niveau 10", count: 22 },
]

function getLevelQuestions(idx, poolArr) {
  let start = 0
  for (let i = 0; i < idx; i++) start += LEVELS[i].count
  return poolArr.slice(start, start + LEVELS[idx].count)
}

const roastTemplates = [
  "Entre nous {pseudo}, t'as une carte d'identité au moins ? 😂",
  "{pseudo}, t'es sûr que t'es pas un intrus ? 🤨",
  "Sérieux {pseudo} ? 😏",
  "{pseudo}, faut refaire l'école avec nous 📚😩",
  "Bon {pseudo}... on va dire que c'était une faute de frappe 😅",
  "Aïe {pseudo}, même ta grand-mère aurait su ça 👵😭",
  "Le Syli National pleure en te regardant, {pseudo} ⚽😢",
  "{pseudo}, t'as un extrait de naissance biométrique au moins ? 🧐",
]

function shuffleOptions(question) {
  const correctText = question.opts[question.a]
  const newOpts = shuffle(question.opts)
  return { ...question, opts: newOpts, a: newOpts.indexOf(correctText) }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SESSION_LENGTH = 15
const TIME_PER_QUESTION = 15
const START_LIVES = 3

function App() {
  const [pool, setPool] = useState(() => shuffle(allQuestions))
  const [session, setSession] = useState(() => shuffle(getLevelQuestions(0, pool)).map(shuffleOptions))
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [xp, setXp] = useState(0)
  const [lives, setLives] = useState(START_LIVES)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [finished, setFinished] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [roastMsg, setRoastMsg] = useState(null)
  const [pendingGameOver, setPendingGameOver] = useState(false)
  const [showAdOverlay, setShowAdOverlay] = useState(false)
  const [adWatched, setAdWatched] = useState(false)
  const [adSeconds, setAdSeconds] = useState(5)

  const audioCtxRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (document.hidden) {
        ctx.suspend()
      } else if (!muted) {
        ctx.resume()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [muted])

  const getAudioCtx = () => {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    if (!audioCtxRef.current) audioCtxRef.current = new AC()
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }

const richTone = (notes, opts = {}) => {
    if (muted) return
    const ctx = getAudioCtx()
    if (!ctx) return
    const { volume = 0.28, type = 'triangle', filterFreq = 3200 } = opts
    try {
      notes.forEach(([freq, start, duration]) => {
        const t = ctx.currentTime + start

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = filterFreq
        filter.connect(ctx.destination)

        const gain = ctx.createGain()
        gain.connect(filter)
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

        const osc = ctx.createOscillator()
        osc.type = type
        osc.frequency.value = freq
        osc.connect(gain)
        osc.start(t)
        osc.stop(t + duration + 0.05)

        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.value = freq * 2
        const gain2 = ctx.createGain()
        gain2.connect(filter)
        gain2.gain.setValueAtTime(0.0001, t)
        gain2.gain.exponentialRampToValueAtTime(volume * 0.35, t + 0.015)
        gain2.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.8)
        osc2.connect(gain2)
        osc2.start(t)
        osc2.stop(t + duration + 0.05)
      })
    } catch (e) {}
  }

  const playCorrect = () => {
    if (muted) return
    const ctx = getAudioCtx()
    if (!ctx) return
    try {
      const notes = [
        { freq: 987.77, start: 0, duration: 0.22 },   // B5
        { freq: 1318.51, start: 0.1, duration: 0.35 }, // E6
      ]
      notes.forEach(({ freq, start, duration }) => {
        const t = ctx.currentTime + start

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 6000
        filter.connect(ctx.destination)

        const gain = ctx.createGain()
        gain.connect(filter)
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.32, t + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

        // fondamentale (timbre "marimba" via triangle)
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = freq
        osc.connect(gain)
        osc.start(t)
        osc.stop(t + duration + 0.05)

        // harmonique octave, plus discrete, donne le cote "cloche"
        const gain2 = ctx.createGain()
        gain2.connect(filter)
        gain2.gain.setValueAtTime(0.0001, t)
        gain2.gain.exponentialRampToValueAtTime(0.12, t + 0.008)
        gain2.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.6)
        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.value = freq * 2
        osc2.connect(gain2)
        osc2.start(t)
        osc2.stop(t + duration + 0.05)
      })
    } catch (e) {}
  }

  const playWrong = () => {
    if (muted) return
    const ctx = getAudioCtx()
    if (!ctx) return
    try {
      const notes = [
        { freq: 196, start: 0, duration: 0.38 },
        { freq: 146, start: 0.28, duration: 0.55 },
      ]
      notes.forEach(({ freq, start, duration }) => {
        const t = ctx.currentTime + start

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 900
        filter.connect(ctx.destination)

        const gain = ctx.createGain()
        gain.connect(filter)
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + duration)

        const lfo = ctx.createOscillator()
        lfo.type = 'sine'
        lfo.frequency.value = 7
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = freq * 0.04
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)
        lfo.start(t)
        lfo.stop(t + duration + 0.05)

        osc.connect(gain)
        osc.start(t)
        osc.stop(t + duration + 0.05)
      })
    } catch (e) {}
  }

  const playGameOver = () => {
    richTone([
      [392, 0, 0.25],
      [329.63, 0.22, 0.25],
      [261.63, 0.44, 0.5],
    ], { volume: 0.28, type: 'triangle', filterFreq: 1800 })
  }

  const playVictory = () => {
    richTone([
      [523.25, 0, 0.16],
      [659.25, 0.13, 0.16],
      [783.99, 0.26, 0.16],
      [1046.5, 0.39, 0.4],
    ], { volume: 0.3, type: 'triangle', filterFreq: 5000 })
  }

  const [levelIndex, setLevelIndex] = useState(0)

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) { setProfile(null); return }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data())
    })
    return unsub
  }, [user])

  const q = session[current]

  const goNext = () => {
    setTimeout(() => {
      setCurrent(c => {
        if (c + 1 < session.length) {
          setTimeLeft(TIME_PER_QUESTION)
          setSelected(null)
          setRoastMsg(null)
          return c + 1
        } else {
          setFinished(true)
          return c
        }
      })
    }, 900)
  }

  const registerWrong = () => {
    playWrong()
    setRoastMsg(roastTemplates[Math.floor(Math.random() * roastTemplates.length)].replace('{pseudo}', profile?.pseudo || 'toi'))
    setLives(l => {
      const nl = l - 1
      if (nl <= 0) setPendingGameOver(true)
      return nl
    })
  }

  const continueAfterRoast = () => {
    setRoastMsg(null)
    if (pendingGameOver) {
      setPendingGameOver(false)
      setGameOver(true)
      return
    }
    setCurrent(c => {
      if (c + 1 < session.length) {
        setTimeLeft(TIME_PER_QUESTION)
        setSelected(null)
        return c + 1
      } else {
        setFinished(true)
        return c
      }
    })
  }

  const handleAnswer = (i) => {
    if (selected !== null || gameOver || finished) return
    setSelected(i)
    if (i === q.a) {
      const bonus = Math.round((timeLeft / TIME_PER_QUESTION) * 50)
      setScore(s => s + 1)
      setXp(x => x + 50 + bonus)
      playCorrect()
      goNext()
    } else {
      registerWrong()
    }
  }

  const [pageHidden, setPageHidden] = useState(document.hidden)

  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (!user || !profile || !profile.pseudo) return
    if (finished || gameOver) return
    if (selected !== null) return
    if (pageHidden) return
    if (timeLeft <= 0) {
      setSelected(-1)
      registerWrong()
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selected, finished, gameOver, pageHidden])

  useEffect(() => {
    if (finished) {
      playVictory()
      if (user && profile && xp > (profile.bestScore || 0)) {
        updateDoc(doc(db, 'users', user.uid), { bestScore: xp })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  useEffect(() => {
    if (gameOver) playGameOver()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver])

  const startLevel = (idx, resetXp = false) => {
    let currentPool = pool
    if (idx === 0) {
      currentPool = shuffle(allQuestions)
      setPool(currentPool)
    }
    setLevelIndex(idx)
    setSession(shuffle(getLevelQuestions(idx, currentPool)).map(shuffleOptions))
    setCurrent(0)
    setScore(0)
    if (resetXp) setXp(0)
    setLives(START_LIVES)
    setSelected(null)
    setTimeLeft(TIME_PER_QUESTION)
    setFinished(false)
    setGameOver(false)
    setRoastMsg(null)
    setPendingGameOver(false)
    setAdWatched(false)
    setShowAdOverlay(false)
  }

  const goToNextLevel = () => {
    const isLast = levelIndex + 1 >= LEVELS.length
    startLevel(isLast ? 0 : levelIndex + 1, isLast)
  }

  const restart = () => startLevel(0, true)

  const APP_URL = "https://guinee-quiz.vercel.app"

  const shareText = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({ text: `${text}\n${APP_URL}` })
      } catch (e) {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + APP_URL)}`, "_blank")
    }
  }

  const generateShareImage = ({ title, scoreLine, xpValue }) => {
    return new Promise((resolve) => {
      const W = 1080, H = 1350
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#0D0D12'
      ctx.fillRect(0, 0, W, H)

      const halo = (x, y, color) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.55)
        g.addColorStop(0, color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }
      halo(W * 0.1, H * 0.08, 'rgba(206,17,38,0.30)')
      halo(W * 0.9, H * 0.15, 'rgba(252,209,22,0.26)')
      halo(W * 0.2, H * 0.95, 'rgba(0,148,96,0.30)')

      const stripeH = 22
      ctx.fillStyle = '#CE1126'; ctx.fillRect(0, 0, W / 3, stripeH)
      ctx.fillStyle = '#FCD116'; ctx.fillRect(W / 3, 0, W / 3, stripeH)
      ctx.fillStyle = '#009460'; ctx.fillRect((2 * W) / 3, 0, W / 3, stripeH)

      ctx.textAlign = 'center'
      ctx.fillStyle = '#F5F1E6'
      ctx.font = '700 60px Arial, sans-serif'
      ctx.fillText('🇬🇳 Quiz Guinée', W / 2, 220)

      ctx.fillStyle = '#F4B400'
      ctx.font = '800 190px Arial, sans-serif'
      ctx.fillText(`${xpValue}`, W / 2, 640)

      ctx.fillStyle = '#F5F1E6'
      ctx.font = '600 48px Arial, sans-serif'
      ctx.fillText('XP', W / 2, 710)

      ctx.fillStyle = '#9B9BA8'
      ctx.font = '600 42px Arial, sans-serif'
      ctx.fillText(scoreLine, W / 2, 800)

      ctx.fillStyle = '#F5F1E6'
      ctx.font = '700 46px Arial, sans-serif'
      wrapText(ctx, title, W / 2, 890, W - 140, 56)

      ctx.fillStyle = '#F4B400'
      ctx.font = '600 34px Arial, sans-serif'
      ctx.fillText('guinee-quiz.vercel.app', W / 2, H - 150)

      ctx.fillStyle = '#9B9BA8'
      ctx.font = '400 30px Arial, sans-serif'
      ctx.fillText('by NafoteK', W / 2, H - 90)

      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ')
    let line = ''
    let curY = y
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line, x, curY)
        line = words[i] + ' '
        curY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, curY)
  }

  const shareResultImage = async ({ title, scoreLine, xpValue, fallbackText }) => {
    try {
      const blob = await generateShareImage({ title, scoreLine, xpValue })
      const file = new File([blob], 'quiz-guinee.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: fallbackText })
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'quiz-guinee.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      shareText(fallbackText)
    }
  }

  const generateRoastImage = (message) => {
    return new Promise((resolve) => {
      const W = 1080, H = 1350
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#0D0D12'
      ctx.fillRect(0, 0, W, H)

      const halo = (x, y, color) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.55)
        g.addColorStop(0, color)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }
      halo(W * 0.1, H * 0.08, 'rgba(206,17,38,0.32)')
      halo(W * 0.9, H * 0.15, 'rgba(252,209,22,0.26)')
      halo(W * 0.2, H * 0.95, 'rgba(0,148,96,0.28)')

      const stripeH = 22
      ctx.fillStyle = '#CE1126'; ctx.fillRect(0, 0, W / 3, stripeH)
      ctx.fillStyle = '#FCD116'; ctx.fillRect(W / 3, 0, W / 3, stripeH)
      ctx.fillStyle = '#009460'; ctx.fillRect((2 * W) / 3, 0, W / 3, stripeH)

      ctx.textAlign = 'center'
      ctx.fillStyle = '#F5F1E6'
      ctx.font = '700 56px Arial, sans-serif'
      ctx.fillText('🇬🇳 Quiz Guinée', W / 2, 220)

      ctx.font = '800 140px Arial, sans-serif'
      ctx.fillText('😂', W / 2, 480)

      ctx.fillStyle = '#F5F1E6'
      ctx.font = '700 58px Arial, sans-serif'
      wrapText(ctx, message, W / 2, 660, W - 160, 74)

      ctx.fillStyle = '#9B9BA8'
      ctx.font = '600 40px Arial, sans-serif'
      ctx.fillText('Arrive a faire mieux ?', W / 2, H - 220)

      ctx.fillStyle = '#F4B400'
      ctx.font = '600 34px Arial, sans-serif'
      ctx.fillText('guinee-quiz.vercel.app', W / 2, H - 150)

      ctx.fillStyle = '#9B9BA8'
      ctx.font = '400 30px Arial, sans-serif'
      ctx.fillText('by NafoteK', W / 2, H - 90)

      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  const shareRoastImage = async (message) => {
    const fallbackText = `😂 ${message}`
    try {
      const blob = await generateRoastImage(message)
      const file = new File([blob], 'quiz-guinee-clash.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: fallbackText })
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'quiz-guinee-clash.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      shareText(fallbackText)
    }
  }

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
    setShowInstallBanner(false)
  }

  const handleLogout = () => signOut(auth)

  const submitFeedback = async () => {
    if (feedbackRating === 0 || feedbackLoading) return
    setFeedbackLoading(true)
    setFeedbackError('')
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: user.uid,
        pseudo: profile?.pseudo || '',
        rating: feedbackRating,
        comment: feedbackComment.trim(),
        createdAt: serverTimestamp(),
      })
      setFeedbackSent(true)
    } catch (e) {
      console.error('feedback error', e)
      setFeedbackError(e.code || e.message || 'Erreur inconnue')
    }
    setFeedbackLoading(false)
  }

  const closeFeedback = () => {
    setShowFeedback(false)
    setFeedbackRating(0)
    setFeedbackComment('')
    setFeedbackSent(false)
  }

  const continueWithAd = () => {
    setShowAdOverlay(false)
    setAdWatched(true)
    setLives(1)
    setGameOver(false)
    setSelected(null)
    setTimeLeft(TIME_PER_QUESTION)
    if (current + 1 >= session.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
    }
  }

  const watchAd = () => setShowAdOverlay(true)

  useEffect(() => {
    if (!showAdOverlay) return
    setAdSeconds(5)
    const id = setInterval(() => {
      setAdSeconds(s => {
        if (s <= 1) {
          clearInterval(id)
          continueWithAd()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdOverlay])

  const levelNodes = []
  LEVELS.forEach((lvl, i) => {
    levelNodes.push(
      <div key={`dot-${i}`} className={`level-dot ${i < levelIndex ? "done" : ""} ${i === levelIndex ? "active" : ""}`}>
        {i < levelIndex ? "✓" : i + 1}
      </div>
    )
    if (i < LEVELS.length - 1) {
      levelNodes.push(<div key={`line-${i}`} className={`level-line ${i < levelIndex ? "done" : ""}`}></div>)
    }
  })

  useEffect(() => {
    if (profile && profile.pseudo) {
      startLevel(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.pseudo])

  if (authLoading) {
    return (
      <div className="app">
        <p style={{color:'white', textAlign:'center', marginTop:'40px'}}>Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <h1>🇬🇳 Quiz Guinée</h1>
        <AuthForm />
        <div className="brand-credit">
          <img src="/nafotek-logo.jpg" alt="NafoteK" />
          <span>by NafoteK</span>
        </div>
      </div>
    )
  }

  if (!profile || !profile.pseudo) {
    return (
      <div className="app">
        <h1>🇬🇳 Quiz Guinée</h1>
        <CompleteProfile user={user} />
      </div>
    )
  }

  return (
    <div className="app">
      {showInstallBanner && (
        <div className="install-banner">
          <span>📲 Installe Quiz Guinée pour jouer hors-ligne</span>
          <div className="install-banner-actions">
            <button className="install-btn" onClick={handleInstall}>Installer</button>
            <button className="install-dismiss" onClick={() => setShowInstallBanner(false)}>✕</button>
          </div>
        </div>
      )}
      <div className="app-header">
        <h1>🇬🇳 Quiz Guinée</h1>
        <div className="header-right">
          <span className="record-badge">🏆 {profile.bestScore || 0}</span>
          <button className="profile-icon" onClick={() => setShowSettings(true)}>
            {(profile.pseudo?.[0] || '?').toUpperCase()}
          </button>
        </div>
      </div>

      <p className="greeting">Salut {profile.pseudo} 👋</p>

      {showSettings && (
        <div className="roast-overlay">
          <div className="roast-modal settings-modal">
            <h2>Paramètres</h2>
            <p className="settings-name">👤 {user.email}</p>
            <p className="settings-pseudo">✨ {profile.pseudo}</p>
            <p className="settings-region">📍 {profile.region}</p>
            <p className="settings-record">🏆 Record : {profile.bestScore || 0} XP</p>
            <div className="settings-row">
              <span>Son</span>
              <label className="switch">
                <input type="checkbox" checked={!muted} onChange={() => setMuted(m => !m)} />
                <span className="slider"></span>
              </label>
            </div>
            <a href="/privacy.html" className="privacy-link">Politique de confidentialité</a>
            {installPrompt && (
              <button className="feedback-btn" onClick={handleInstall}>📲 Installer l'application</button>
            )}
            <button className="feedback-btn" onClick={() => setShowSettings(false) || setShowFeedback(true)}>⭐ Donner mon avis</button>
            <button className="logout-btn full" onClick={handleLogout}>Déconnexion</button>
            <div className="brand-credit settings-credit">
              <img src="/nafotek-logo.jpg" alt="NafoteK" />
              <span>by NafoteK</span>
            </div>
            <button className="roast-continue" onClick={() => setShowSettings(false)}>Fermer</button>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="roast-overlay">
          <div className="roast-modal feedback-modal">
            {feedbackSent ? (
              <>
                <h2>Merci ! 🙏</h2>
                <p className="settings-record">Ton avis a bien été envoyé.</p>
                <button className="roast-continue" onClick={closeFeedback}>Fermer</button>
              </>
            ) : (
              <>
                <h2>Ton avis compte</h2>
                <p className="settings-record">Note le quiz et laisse une suggestion si tu veux.</p>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      className={`star ${n <= feedbackRating ? "filled" : ""}`}
                      onClick={() => setFeedbackRating(n)}
                    >★</span>
                  ))}
                </div>
                <textarea
                  className="feedback-textarea"
                  placeholder="Une suggestion, une idée, un bug ? (optionnel)"
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  rows={3}
                />
                {feedbackError && <p className="auth-error">{feedbackError}</p>}
                <button className="roast-continue" onClick={submitFeedback} disabled={feedbackRating === 0 || feedbackLoading}>
                  {feedbackLoading ? "Envoi..." : "Envoyer"}
                </button>
                <button className="auth-switch" onClick={closeFeedback}>Annuler</button>
              </>
            )}
          </div>
        </div>
      )}

      {roastMsg && (
        <div className="roast-overlay">
          <div className="roast-modal">
            <p className="roast-text">{roastMsg}</p>
            <button className="share-btn" onClick={() => shareRoastImage(roastMsg)}>📤 Partager ce clash</button>
            <button className="roast-continue" onClick={continueAfterRoast}>Continuer</button>
            <div className="brand-credit">
              <img src="/nafotek-logo.jpg" alt="NafoteK" />
              <span>by NafoteK</span>
            </div>
          </div>
        </div>
      )}

      {showAdOverlay && (
        <div className="roast-overlay">
          <div className="roast-modal ad-modal">
            <h2>📺 Publicité</h2>
            <p className="ad-text">Chargement... merci de patienter</p>
            <div className="ad-timer">{adSeconds}s</div>
          </div>
        </div>
      )}

      {!finished && !gameOver && q && (
        <div className="card">
          <div className="topbar">
            <span className="lives">
              {Array.from({ length: START_LIVES }).map((_, i) => (
                <span key={i}>{i < lives ? '♥' : '♡'}</span>
              ))}
            </span>
            <span className="xp">⭐ {xp} XP</span>
          </div>

          <div className="levels-track">{levelNodes}</div>

          <div className="timerbar">
            <div className={`timerfill ${timeLeft <= 5 ? "danger" : ""}`} style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}></div>
          </div>

          <p className="progress">{LEVELS[levelIndex].name} — Question {current + 1} / {session.length}</p>
          <h2>{q.q}</h2>
          <div className="options">
            {q.opts.map((opt, i) => {
              let cls = "option"
              if (selected !== null) {
                if (i === q.a) cls += " correct"
                else if (i === selected) cls += " wrong"
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selected !== null}>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="card result gameover">
          <h2>Partie terminée</h2>
          <p>{LEVELS[levelIndex].name} — Tu as perdu toutes tes vies.</p>
          <p className="finalxp">XP gagné : {xp}</p>
          <p>Bonnes réponses : {score} / {current + 1}</p>
          <button
            className="share-btn"
            onClick={() => shareResultImage({
              title: 'Partie terminee',
              scoreLine: `Bonnes reponses : ${score}/${current + 1}`,
              xpValue: xp,
              fallbackText: `🇬🇳 J'ai fait ${xp} XP avant de perdre toutes mes vies sur Quiz Guinée ! Arrive à me battre 😏`,
            })}
          >📤 Partager</button>
          {!adWatched && (
            <button className="restart" onClick={watchAd}>📺 Regarder une pub pour continuer</button>
          )}
          <button className="back-levels" onClick={restart}>Reprendre</button>
          <div className="brand-credit">
            <img src="/nafotek-logo.jpg" alt="NafoteK" />
            <span>by NafoteK</span>
          </div>
        </div>
      )}

      {finished && !gameOver && (
        <div className="card result">
          <h2>{LEVELS[levelIndex].name} termine !</h2>
          <p className="finalxp">XP total : {xp}</p>
          <p>Ton score : {score} / {session.length}</p>
          <button
            className="share-btn"
            onClick={() => shareResultImage({
              title: `${LEVELS[levelIndex].name} termine !`,
              scoreLine: `Score : ${score}/${session.length}`,
              xpValue: xp,
              fallbackText: `🇬🇳 J'ai obtenu ${xp} XP sur ${LEVELS[levelIndex].name} du Quiz Guinée ! Tu fais mieux que moi ?`,
            })}
          >📤 Partager mon score</button>
          {levelIndex + 1 < LEVELS.length ? (
            <button className="restart" onClick={goToNextLevel}>Niveau suivant</button>
          ) : (
            <>
              <p>🎉 Quiz complet ! Tu as fini tous les niveaux.</p>
              <button className="restart" onClick={goToNextLevel}>Recommencer depuis le debut</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App

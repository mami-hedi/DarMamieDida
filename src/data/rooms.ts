export interface RoomTranslation {
  name: string;
  shortDescription: string;
  fullDescription: string;
  amenities: string[];
}

export interface Room {
  id: string;
  slug: string;
  price: number;
  size: number;
  capacity: number;
  image: string;
  translations: {
    fr: RoomTranslation;
    en: RoomTranslation;
  };
}

export const rooms: Room[] = [
  {
    id: "1",
    slug: "chambre1",
    price: 120,
    size: 25,
    capacity: 2,
    image: "/src/assets/gallery/photo6.jpeg",
    translations: {
      fr: {
        name: "Chambre 1",
        shortDescription: "Une chambre élégante aux tons chaleureux, idéale pour un séjour romantique.",
        fullDescription:
          "La chambre ch MH1 vous accueille dans une atmosphère raffinée où le rouge profond se marie harmonieusement avec le blanc immaculé. Dotée d'un lit king-size et d'une salle de bain privative en marbre, cette chambre offre une vue imprenable sur le jardin. Parfaite pour les couples en quête d'intimité et de confort.",
        amenities: ["Lit King-Size", "Salle de bain privée", "Vue jardin", "Climatisation", "Wi-Fi gratuit", "Petit-déjeuner inclus"]
      },
      en: {
        name: "Room 1",
        shortDescription: "An elegant room with warm tones, perfect for a romantic stay.",
        fullDescription:
          "Room MH1 welcomes you into a refined atmosphere where deep red blends harmoniously with pure white. Featuring a king-size bed and a private marble bathroom, this room offers stunning garden views. Perfect for couples seeking intimacy and comfort.",
        amenities: ["King-Size Bed", "Private Bathroom", "Garden View", "Air Conditioning", "Free Wi-Fi", "Breakfast included"]
      }
    }
  },
  {
    id: "2",
    slug: "chambre2",
    price: 150,
    size: 30,
    capacity: 2,
    image: "/src/assets/gallery/photo7.jpeg",
    translations: {
      fr: {
        name: "Chambre 2",
        shortDescription: "Une suite sophistiquée alliant modernité et tradition.",
        fullDescription:
          "La suite ch MH2 représente l'alliance parfaite entre le design contemporain et l'artisanat traditionnel. Ses 30m² vous offrent un espace généreux avec coin salon, un lit queen-size exceptionnellement confortable et une terrasse privée. Les touches de noir et blanc créent une ambiance chic et apaisante.",
        amenities: ["Lit Queen-Size", "Terrasse privée", "Coin salon", "Minibar", "Coffre-fort", "Service de chambre"]
      },
      en: {
        name: "Room 2",
        shortDescription: "A sophisticated suite blending modernity and tradition.",
        fullDescription:
          "Room MH2 perfectly blends contemporary design with traditional craftsmanship. Its 30m² offers a generous space with a seating area, an exceptionally comfortable queen-size bed, and a private terrace. Black and white touches create a chic and soothing atmosphere.",
        amenities: ["Queen-Size Bed", "Private Terrace", "Seating Area", "Minibar", "Safe", "Room Service"]
      }
    }
  },
  {
    id: "3",
    slug: "chambre3",
    price: 200,
    size: 40,
    capacity: 2,
    image: "/src/assets/gallery/photo9.jpeg",
    translations: {
      fr: {
        name: "Chambre 3",
        shortDescription: "Notre suite signature offrant le summum du luxe.",
        fullDescription:
          "La suite ch MH3 est notre joyau, portant fièrement le nom de notre maison. Cette suite de 40m² incarne l'excellence avec son lit à baldaquin, sa baignoire îlot et son salon privé. Chaque détail a été pensé pour vous offrir une expérience inoubliable. Vue panoramique sur les jardins et service de conciergerie dédié.",
        amenities: ["Lit à baldaquin", "Baignoire îlot", "Salon privé", "Vue panoramique", "Conciergerie", "Champagne de bienvenue"]
      },
      en: {
        name: "Room 3",
        shortDescription: "Our signature suite offering the ultimate luxury.",
        fullDescription:
          "Room MH3 is our jewel, proudly bearing our house name. This 40m² suite embodies excellence with its canopy bed, freestanding bathtub, and private lounge. Every detail is designed to provide an unforgettable experience. Panoramic garden view and dedicated concierge service.",
        amenities: ["Canopy Bed", "Freestanding Bathtub", "Private Lounge", "Panoramic View", "Concierge", "Welcome Champagne"]
      }
    }
  },
  {
    id: "4",
    slug: "chambre4",
    price: 100,
    size: 22,
    capacity: 2,
    image: "/src/assets/gallery/photo12.jpeg",
    translations: {
      fr: {
        name: "Chambre 4",
        shortDescription: "Une chambre lumineuse d'inspiration méditerranéenne.",
        fullDescription:
          "La chambre Ghada capture l'essence de la Méditerranée avec ses murs blancs, ses touches de terracotta et sa lumière naturelle abondante. Idéale pour les voyageurs en quête de sérénité, elle dispose d'un lit double confortable et d'une douche à l'italienne. Le balcon offre une vue apaisante sur la cour intérieure.",
        amenities: ["Lit Double", "Balcon", "Douche italienne", "Climatisation", "Wi-Fi gratuit", "Petit-déjeuner inclus"]
      },
      en: {
        name: "Room 4",
        shortDescription: "A bright room with Mediterranean inspiration.",
        fullDescription:
          "Room Ghada captures the essence of the Mediterranean with its white walls, terracotta touches, and abundant natural light. Ideal for travelers seeking serenity, it has a comfortable double bed and an Italian-style shower. The balcony offers a peaceful view of the courtyard.",
        amenities: ["Double Bed", "Balcony", "Italian Shower", "Air Conditioning", "Free Wi-Fi", "Breakfast included"]
      }
    }
  },
  {
    id: "5",
    slug: "chambre5",
    price: 90,
    size: 20,
    capacity: 2,
    image: "/src/assets/room-papo.jpg",
    translations: {
      fr: {
        name: "Chambre 5",
        shortDescription: "Un cocon chaleureux au charme vintage.",
        fullDescription:
          "La chambre ch MH 5 vous transporte dans une ambiance chaleureuse où le charme vintage rencontre le confort moderne. Son coin lecture près de la fenêtre, ses textiles doux et sa décoration soignée en font un refuge parfait. Cette chambre de 20m² convient parfaitement aux voyageurs solo ou aux couples.",
        amenities: ["Lit Double", "Coin lecture", "Salle d'eau", "Chauffage", "Wi-Fi gratuit", "Thé et café offerts"]
      },
      en: {
        name: "Room 5",
        shortDescription: "A warm cocoon with vintage charm.",
        fullDescription:
          "Room MH5 transports you into a warm atmosphere where vintage charm meets modern comfort. The reading corner by the window, soft textiles, and thoughtful decor make it a perfect refuge. This 20m² room is ideal for solo travelers or couples.",
        amenities: ["Double Bed", "Reading Corner", "Bathroom", "Heating", "Free Wi-Fi", "Tea & Coffee"]
      }
    }
  }
];

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find(room => room.slug === slug);
}

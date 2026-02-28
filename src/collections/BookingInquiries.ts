import type { CollectionConfig } from 'payload'

export const BookingInquiries: CollectionConfig = {
  slug: 'booking-inquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Anfragen',
    defaultColumns: ['name', 'email', 'place', 'checkIn', 'checkOut', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'checkIn',
      type: 'date',
      label: 'Anreise',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
      },
    },
    {
      name: 'checkOut',
      type: 'date',
      label: 'Abreise',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
      },
    },
    {
      name: 'place',
      type: 'relationship',
      relationTo: 'places',
      required: true,
    },
    {
      name: 'placeTitle',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Denormalisierter Ortstitel zum Zeitpunkt der Anfrage',
      },
    },
    {
      name: 'emailSent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Ob die E-Mail-Benachrichtigung erfolgreich versendet wurde',
      },
    },
  ],
}

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'stock',
      title: 'Stock',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Dresses', value: 'dresses' },
          { title: 'Tops', value: 'tops' },
          { title: 'Bottoms', value: 'bottoms' },
          { title: 'Outerwear', value: 'outerwear' },
          { title: 'Accessories', value: 'accessories' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'emotionBoost',
      title: 'Emotion Boost',
      type: 'number',
      description: 'Discount multiplier for emotion-based pricing (0-1)',
      validation: (Rule: any) => Rule.min(0).max(1),
      initialValue: 0.15,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      subtitle: 'category',
    },
  },
};

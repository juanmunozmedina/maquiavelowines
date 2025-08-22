import { z } from 'zod';

export const stripeProductMetadataSchema = z
	.object({
		productVariantId: z.string(),
		productName: z.string(),
		productId: z.string(),
		variantName: z.string(),
		variantId: z.string(),
	})
	.strict();

import type { CookieConsentConfig } from 'vanilla-cookieconsent';

// Extend the Window interface to include the dataLayer object
declare global {
	interface Window {
		dataLayer: Record<string, any>[];
		gtag: (...args: any[]) => void;
	}
}

export const config: CookieConsentConfig = {
	// Indicate the consent to live in the #cc-container element
	root: '#cc-container',
	guiOptions: {
		consentModal: {
			layout: 'box',
			position: 'bottom left',
			equalWeightButtons: true,
			flipButtons: false,
		},
		preferencesModal: {
			layout: 'box',
			position: 'right',
			equalWeightButtons: true,
			flipButtons: false,
		},
	},
	categories: {
		necessary: {
			readOnly: true,
		},
		functionality: {},
		analytics: {
			enabled: true,
			services: {
				ga: {
					label: 'Google Analytics',
					onAccept: () => {
						// Grant consent to the Google Analytics service
						console.log('ga4 granted');
						window.gtag('consent', 'update', {
							ad_storage: 'granted',
							ad_user_data: 'granted',
							ad_personalization: 'granted',
							analytics_storage: 'granted',
						});
					},
					onReject: () => {
						// Don't enable Google Analytics
						console.log('ga4 rejected');
					},
				},
			},
		},
		marketing: {},
	},
	language: {
		default: 'es',
		autoDetect: 'browser',
		translations: {
			es: {
				consentModal: {
					title: '¡Hola amante del vino, es la hora de las galletas!',
					description:
						"En Bodegas Maquiavelo® solo vendemos vino y usamos las 'cookies' para obtener datos estadísticos de la navegación de nuestros usuarios y mejorar nuestros servicios.",
					acceptAllBtn: 'Aceptar todo',
					acceptNecessaryBtn: 'Rechazar todo',
					showPreferencesBtn: 'Gestionar preferencias',
					footer:
						'<a target="_blank" rel="noopener noreferrer" href="/privacidad">Política de privacidad</a>\n<a target="_blank" rel="noopener noreferrer" href="/cookies">Términos y condiciones</a>',
				},
				preferencesModal: {
					title: 'Preferencias de Consentimiento',
					acceptAllBtn: 'Aceptar todo',
					acceptNecessaryBtn: 'Rechazar todo',
					savePreferencesBtn: 'Guardar preferencias',
					closeIconLabel: 'Cerrar modal',
					serviceCounterLabel: 'Servicios',
					sections: [
						{
							title: 'Uso de Cookies',
							description:
								'Las cookies son pequeños fragmentos de texto que los sitios web que visitas envían al navegador. Permiten que los sitios web recuerden información sobre tu visita, lo que puede hacer que sea más fácil volver a visitar los sitios y hacer que estos te resulten más útiles.',
						},
						{
							title:
								'Cookies Estrictamente Necesarias <span class="pm__badge">Siempre Habilitado</span>',
							description:
								'Una cookie estrictamente necesaria, también conocida como cookie esencial, es una cookie necesaria para el correcto funcionamiento de su sitio web. Una cookie estrictamente necesaria puede almacenar la configuración guardada o la información de inicio de sesión de un usuario, o proporcionar seguridad a un sitio web.',
							linkedCategory: 'necessary',
						},
						{
							title: 'Cookies de Funcionalidad',
							description:
								'Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar en nuestros sistemas. De forma general, solo se utilizan en acciones como cuando solicita servicios, establece sus preferencias de privacidad, inicia sesión o completa formularios.',
							linkedCategory: 'functionality',
						},
						{
							title: 'Cookies Analíticas',
							description:
								'Son utilizadas para recabar estadísticas de actividad del usuario. Entre otros, se analizan el número de usuarios que visitan el sitio web, el número de páginas visitadas así como la actividad de los usuarios en el sitio web y su frecuencia de utilización.',
							linkedCategory: 'analytics',
						},
						{
							title: 'Cookies Publicitarias',
							description:
								'Estas cookies recopilan información sobre su comportamiento de navegación para mostrar anuncios que sean relevantes. Registramos cuándo visitó nuestro sitio web por última vez y qué actividades ha realizado en el sitio web. También se utilizan para limitar el número de veces que el usuario ve un anuncio, así como para ayudar a medir la eficacia de las campañas publicitarias. Esta información se utiliza para crear un perfil de interés, que compartimos entre nosotros y que nos permite mostrar anuncios relevantes para usted en otros sitios web.',
							linkedCategory: 'marketing',
						},
						{
							title: 'Más información',
							description:
								'Para cualquier consulta en relación con la política de cookies y sus opciones, por favor <a class="cc__link" href="mailto:info@maquiavelowines.com">contáctanos</a>.',
						},
					],
				},
			},
		},
	},
};

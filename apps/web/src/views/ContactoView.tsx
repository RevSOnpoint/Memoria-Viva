import React, { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck
} from 'lucide-react';

interface ContactoViewProps {
  onNavigate: (view: string, params?: any) => void;
}

const contactChannels = [
  {
    icon: Mail,
    label: 'Correo general',
    value: 'contacto@legadovivo.cr',
    href: 'mailto:contacto@legadovivo.cr'
  },
  {
    icon: ShieldCheck,
    label: 'Privacidad y datos personales',
    value: 'privacidad@legadovivo.cr',
    href: 'mailto:privacidad@legadovivo.cr'
  },
  {
    icon: Phone,
    label: 'Teléfono institucional',
    value: '+506 2450 7890',
    href: 'tel:+50624507890'
  },
  {
    icon: MapPin,
    label: 'Sede',
    value: 'Palmares, Alajuela, Costa Rica',
    href: ''
  }
];

export const ContactoView: React.FC<ContactoViewProps> = ({ onNavigate }) => {
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get('nombre') || '');
    const correo = String(formData.get('correo') || '');
    const asunto = String(formData.get('asunto') || 'Consulta general');
    const mensaje = String(formData.get('mensaje') || '');

    const body = [
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      '',
      mensaje
    ].join('\n');

    window.location.href =
      `mailto:contacto@legadovivo.cr?subject=${encodeURIComponent(`[Memoria Viva] ${asunto}`)}` +
      `&body=${encodeURIComponent(body)}`;

    setMensajeEnviado(true);
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto">
      <section className="rounded-lg border border-[#d5ddd6] bg-[#1f352f] text-white p-6 sm:p-10">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b9d3c7]">
          Fundación Legado Vivo
        </div>
        <h1 className="mt-3 font-serif font-bold text-3xl sm:text-4xl">Contacto</h1>
        <p className="mt-4 text-sm sm:text-base text-[#dde6e0] leading-relaxed max-w-2xl">
          Estamos para escucharle. Si desea compartir una historia, corregir un expediente,
          colaborar con la Fundación o plantear una consulta sobre privacidad, escriba a nuestro
          equipo.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5">
        <div className="space-y-4">
          {contactChannels.map(channel => (
            <div key={channel.label} className="bg-white border border-[#dde3dc] rounded p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-[#eef1eb] text-[#2f5d50] flex items-center justify-center flex-shrink-0">
                  <channel.icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c75]">
                    {channel.label}
                  </div>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-1 block text-sm font-semibold text-[#1d2b28] hover:text-[#2f5d50] break-words"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <div className="mt-1 text-sm font-semibold text-[#1d2b28]">{channel.value}</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-[#eef1eb] border border-[#dde3dc] rounded p-5">
            <div className="flex items-center gap-2 text-[#2f5d50]">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Horario de atención</span>
            </div>
            <p className="mt-2 text-sm text-[#344a43] leading-relaxed">
              Lunes a viernes, de 8:00 a. m. a 4:00 p. m.
              <br />
              Visitas al archivo con cita previa.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#dde3dc] rounded p-6 sm:p-8">
          <h2 className="font-serif font-bold text-2xl text-[#1d2b28]">Escríbanos</h2>
          <p className="mt-1 text-sm text-[#5a6b64] leading-relaxed">
            Complete el formulario y se abrirá su aplicación de correo con el mensaje preparado.
            También puede escribir directamente a contacto@legadovivo.cr.
          </p>

          {mensajeEnviado && (
            <div className="mt-4 p-3 rounded bg-[#eef6f0] border border-[#c4ded0] text-xs text-[#2c6e4f]">
              Se preparó el mensaje en su aplicación de correo. Si no se abrió, escriba a
              contacto@legadovivo.cr.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-[#344a43] mb-1.5">
                  Nombre completo
                </span>
                <input
                  type="text"
                  name="nombre"
                  required
                  autoComplete="name"
                  className="w-full min-h-[46px] px-3 rounded border border-[#aebbb3] bg-white text-sm"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-[#344a43] mb-1.5">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  name="correo"
                  required
                  autoComplete="email"
                  className="w-full min-h-[46px] px-3 rounded border border-[#aebbb3] bg-white text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-semibold text-[#344a43] mb-1.5">Asunto</span>
              <select
                name="asunto"
                className="w-full min-h-[46px] px-3 rounded border border-[#aebbb3] bg-white text-sm"
              >
                <option>Consulta general</option>
                <option>Quiero compartir una historia</option>
                <option>Corrección o retiro de un relato</option>
                <option>Privacidad y datos personales</option>
                <option>Voluntariado y alianzas</option>
                <option>Accesibilidad</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-semibold text-[#344a43] mb-1.5">Mensaje</span>
              <textarea
                name="mensaje"
                required
                rows={5}
                className="w-full px-3 py-2.5 rounded border border-[#aebbb3] bg-white text-sm resize-y"
              />
            </label>

            <label className="flex items-start gap-2 text-xs text-[#5a6b64] leading-relaxed">
              <input type="checkbox" required className="mt-0.5 accent-[#2f5d50]" />
              <span>
                He leído y acepto la{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('privacidad')}
                  className="font-semibold text-[#2f5d50] underline underline-offset-2"
                >
                  política de privacidad
                </button>
                .
              </span>
            </label>

            <button type="submit" className="btn-primary text-sm gap-2 w-full sm:w-auto">
              <Send className="w-4 h-4" />
              Enviar mensaje
            </button>
          </form>

          <button
            onClick={() => onNavigate('preguntas')}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#2f5d50] hover:text-[#254a40] transition"
          >
            Consultar preguntas frecuentes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

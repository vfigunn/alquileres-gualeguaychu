import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inmobiliaria, nombre, email, telefono, mensaje } = body;

    if (!inmobiliaria || !nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: { message: 'Faltan campos obligatorios' } },
        { status: 400 }
      );
    }

    const senderEmail = process.env.NODE_ENV === 'development'
      ? 'onboarding@resend.dev'
      : 'Alquileres Gualeguaychú <no-reply@alquileresgualeguaychu.com>';

    // 1. Notificar al administrador
    const { data: adminData, error: adminError } = await resend.emails.send({
      from: senderEmail,
      to: ['alquileresgualeguaychu@protonmail.com'],
      subject: `Nueva solicitud de integración: ${inmobiliaria}`,
      html: `
        <h2>Nueva solicitud de integración de inmobiliaria</h2>
        <p><strong>Inmobiliaria:</strong> ${inmobiliaria}</p>
        <p><strong>Contacto:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No especificado'}</p>
        <br />
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br />')}</p>
      `,
      replyTo: email,
    });

    if (adminError) {
      console.error('Error sending admin notification:', adminError);
    }

    // 2. Enviar confirmación al usuario usando el template
    const { data: confirmData, error: confirmError } = await resend.emails.send({
      from: senderEmail,
      to: [email],
      subject: '',  // lo define el template
      template: {
        id: '75a06ac0-45ad-4150-abac-ec3dd7b5f60d',
        variables: {
          NOMBRE: nombre,
          INMOBILIARIA: inmobiliaria,
        },
      },
    });

    if (confirmError) {
      console.error('Error sending confirmation email:', confirmError);
    }

    return NextResponse.json({ data: { admin: adminData, confirmation: confirmData }, error: null });
  } catch (err: any) {
    console.error('Unexpected error in contact API:', err);
    return NextResponse.json(
      { error: { message: 'Error interno del servidor', name: 'ServerError' } },
      { status: 500 }
    );
  }
}

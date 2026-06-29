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

    const { data, error } = await resend.emails.send({
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

    if (error) {
      console.error('Error from Resend:', error);
      return NextResponse.json(
        { error: { message: error.message, name: error.name } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    console.error('Unexpected error in contact API:', err);
    return NextResponse.json(
      { error: { message: 'Error interno del servidor', name: 'ServerError' } },
      { status: 500 }
    );
  }
}

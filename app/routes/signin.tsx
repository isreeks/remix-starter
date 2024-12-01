import { Form as RemixForm, redirect, useNavigate } from "@remix-run/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { authClient } from "~/lib/auth.client"
import { z } from 'zod';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    // password: z.string().regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/).min(8, {
    //     message: "Password must be at least 8 characters.",
    // }),

    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." })
        .max(20, { message: "Password must be under 12 characters." })
        .refine((password) => /[A-Z]/.test(password), {
            message: "Password must contain at least one uppercase letter.",
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Password must contain at least one lowercase letter.",
        })
        .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one digit." })
        .refine((password) => /[!@#$%^&*]/.test(password), {
            message: "Password must contain at least one special character.",
        }),

})

export default function signin() {
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    async function onSubmit(values: z.infer<typeof formSchema>) {
        await authClient.signIn.email(
            {
                email: values.email,
                password: values.password,
            },
            {
                onRequest: (ctx) => {
                    // show loading state
                },
                onSuccess: (ctx) => {
                    navigate("/")
                },
                onError: (ctx) => {
                    alert(ctx.error)
                },
            },
        )
    }

    return (
        <div className=" flex justify-center items-center h-screen">
        <div className="w-[350px]" >
            <h2 className=" text-2xl font-semibold">
                Sign In
            </h2>

            <Form  {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mt-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>password</FormLabel>
                                <FormControl>
                                    <Input type='password' placeholder="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="text-lg font-semibold w-full " size={"lg"} type="submit" >Sign In</Button>
                </form>
            </Form>

            <Button variant={"outline"} className="  w-full mt-4"  onClick={() => navigate("/signup")}>Sign Up</Button>

        </div>
        </div>

    )
}
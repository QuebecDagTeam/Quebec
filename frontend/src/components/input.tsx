 interface IFORM {
    label:string,
    placeholder:string,
    value:string,
    action:()=>void
 }

 

export const Input = ({label, placeholder, value, action}:IFORM) =>{
    return(
        <div className='flex flex-col gap-5 w-full'>
            <label>{label}</label>
            <input type='text' placeholder={placeholder} 
            className='w-auto bg-[#424242] py-5 rounded-full px-5 border-none outline-none'
            value={value}
            onClick={action}
            />
        </div>
    )
}
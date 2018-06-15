import toastr from'./toastr';

export function checkloginStatus(nextState, replace) {  
  if (!localStorage.jwt) {
      
     toastr["error"]("Please Login to view the requested page","Authorization Error");
       
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    });
  }
}
